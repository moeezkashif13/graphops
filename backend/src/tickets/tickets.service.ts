import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketEntity } from './ticket.entity';
import { AgentService } from '../agent/agent.service';
import { TicketsGateway } from './tickets.gateway';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
    private readonly agentService: AgentService,
    private readonly ticketsGateway: TicketsGateway,
  ) {}

  async getAllTickets() {
    const records = await this.ticketRepo.find({
      order: { createdAt: 'DESC' },
    });

    return records.map((ticket) => ({
      id: ticket.id,
      sender: ticket.sender,
      body: ticket.body,
      category: ticket.categories ? JSON.parse(ticket.categories) : null,
      sentiment: ticket.sentiment,
      status: ticket.status,

      // Real timestamp for sorting
      createdAt: ticket.createdAt.toISOString(),

      // Human-readable time for display
      timestamp: ticket.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  }

  async processInboundTicket(sender: string, body: string) {
    const ticketId = `tk_${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = this.ticketRepo.create({
      id: ticketId,
      sender,
      body,
      status: 'processing',
    });

    await this.ticketRepo.save(ticket);

    // Broadcast the newly created ticket
    this.ticketsGateway.emitTicketUpdate(ticketId, 'processing', {
      sender,
      body,
      createdAt: ticket.createdAt.toISOString(),
    });

    // Execute the AI workflow in the background
    this.executeAgentGraphBackground(ticketId, sender, body);

    return {
      id: ticketId,
      sender,
      body,
      status: 'processing' as const,
      category: null,
      sentiment: null,

      createdAt: ticket.createdAt.toISOString(),

      timestamp: ticket.createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }

  // private async executeAgentGraphBackground(
  //   ticketId: string,
  //   sender: string,
  //   body: string,
  // ) {
  //   try {
  //     const result = await this.agentService.triggerInboundWorkflow(
  //       ticketId,
  //       sender,
  //       body,
  //     );

  //     await this.ticketRepo.update(ticketId, {
  //       status: result.status as any,
  //       categories: JSON.stringify(result.currentState.categories || []),
  //       sentiment: result.currentState.sentiment || 'NEUTRAL',
  //     });

  //     // Broadcast processed ticket state
  //     this.ticketsGateway.emitTicketUpdate(ticketId, result.status, {
  //       category: result.currentState.categories,
  //       sentiment: result.currentState.sentiment,
  //     });
  //   } catch (error) {
  //     console.error(
  //       `[TicketsService] Background execution error on ticket ${ticketId}:`,
  //       error,
  //     );
  //   }
  // }

  private async executeAgentGraphBackground(
    ticketId: string,
    sender: string,
    body: string,
  ) {
    try {
      const result = await this.agentService.triggerInboundWorkflow(
        ticketId,
        sender,
        body,
      );

      // Explicitly confirm the layout parameters are arrays before mapping to string rows
      const cats = Array.isArray(result.currentState?.categories)
        ? result.currentState.categories
        : [];

      await this.ticketRepo.update(ticketId, {
        status: (result.status || 'pending_approval') as any,
        categories: JSON.stringify(cats),
        sentiment: result.currentState?.sentiment || 'NEUTRAL',
      });

      this.ticketsGateway.emitTicketUpdate(ticketId, result.status, {
        category: cats,
        sentiment: result.currentState?.sentiment || 'NEUTRAL',
      });
    } catch (error) {
      console.error(
        `[TicketsService] Background execution failure on token frame ${ticketId}:`,
        error,
      );
    }
  }
  async getLiveSnapshot(ticketId: string) {
    const values = await this.agentService.getGraphStateSnapshot(ticketId);

    return {
      categories: values?.categories || [],
      sentiment: values?.sentiment || 'NEUTRAL',
      requiresHumanReview: values?.requiresHumanReview || false,
      humanApproved: values?.humanApproved || false,
      draftResponse: values?.draftResponse || null,
      retrievedContextChunks: values?.retrievedContextChunks || [],
      stripeAccountStatus: values?.stripeAccountStatus || null,
    };
  }
  async approveAndResume(ticketId: string, editedDraft: string) {
    const match = await this.ticketRepo.findOne({
      where: { id: ticketId },
    });

    if (!match) {
      throw new NotFoundException('Target ticket context not found');
    }

    const result = await this.agentService.approveAndResumeWorkflow(
      ticketId,
      editedDraft,
    );

    await this.ticketRepo.update(ticketId, {
      status: 'resolved',
      finalDraft: editedDraft,
    });

    this.ticketsGateway.emitTicketUpdate(ticketId, 'resolved');

    return result;
  }

  async rejectTicketWorkflow(ticketId: string) {
    const match = await this.ticketRepo.findOne({
      where: { id: ticketId },
    });

    if (!match) {
      throw new NotFoundException('Target ticket context not found');
    }

    const result = await this.agentService.rejectAndTerminateWorkflow(ticketId);

    await this.ticketRepo.update(ticketId, {
      status: 'rejected',
    });

    this.ticketsGateway.emitTicketUpdate(ticketId, 'rejected');

    return result;
  }
}
