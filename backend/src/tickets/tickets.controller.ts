// src/tickets/tickets.controller.ts
import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async listAllActiveQueueItems() {
    return this.ticketsService.getAllTickets();
  }

  @Post('webhook')
  async handleIncomingCustomerWebhook(
    @Body() payload: { sender: string; body: string },
  ) {
    return this.ticketsService.processInboundTicket(
      payload.sender,
      payload.body,
    );
  }

  @Get(':id/graph-state')
  async getLiveLangGraphSnapshotState(@Param('id') id: string) {
    return this.ticketsService.getLiveSnapshot(id);
  }

  @Post(':id/resume')
  async resumeInterruptedGraphState(
    @Param('id') id: string,
    @Body() payload: { finalDraft: string },
  ) {
    return this.ticketsService.approveAndResume(id, payload.finalDraft);
  }

  @Post(':id/reject')
  async rejectInterruptedGraphState(@Param('id') id: string) {
    return this.ticketsService.rejectTicketWorkflow(id);
  }
}
