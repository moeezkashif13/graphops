import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
