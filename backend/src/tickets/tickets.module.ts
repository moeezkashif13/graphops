import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { AgentModule } from '../agent/agent.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';
import { TicketsGateway } from './tickets.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity]), AgentModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsGateway],
  exports: [TicketsGateway],
})
export class TicketsModule {}
