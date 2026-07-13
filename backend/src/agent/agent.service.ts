// // import { Injectable, OnModuleInit } from '@nestjs/common';
// // import { MemorySaver } from '@langchain/langgraph';
// // import { crmAgentWorkflow } from './agent.engine';
// // import { AgentStateInterface } from './agent.state';
// // import { KnowledgeService } from 'src/knowledge/knowledge.service';

// // @Injectable()
// // export class AgentService implements OnModuleInit {
// //   private checkpointer = new MemorySaver();

// //   // Explicitly typing our compiled graph property
// //   private compiledGraph!: ReturnType<typeof crmAgentWorkflow.compile>;

// //   // onModuleInit() {
// //   //   // Compile the raw workflow layout here, binding our NestJS service checkpointer
// //   //   this.compiledGraph = crmAgentWorkflow.compile({
// //   //     checkpointer: this.checkpointer,
// //   //     interruptAfter: ['composer'],
// //   //   });
// //   // }

// //   constructor(private readonly knowledgeService: KnowledgeService) {}

// //   onModuleInit() {
// //     // Compile the workflow layout, telling it to pause right before the human_review node
// //     this.compiledGraph = crmAgentWorkflow.compile({
// //       checkpointer: this.checkpointer,
// //       interruptBefore: ['human_review'], // Changed from interruptAfter to interruptBefore!
// //     });
// //   }

// //   /**
// //    * Spawns a brand new LangGraph execution thread from an inbound customer email.
// //    */
// //   async triggerInboundWorkflow(ticketId: string, email: string, text: string) {
// //     console.log(
// //       `[AgentService] Starting new asynchronous workflow thread for ticket: ${ticketId}`,
// //     );

// //     const config = { configurable: { thread_id: ticketId } };

// //     const initialState: Partial<AgentStateInterface> = {
// //       ticketId,
// //       customerEmail: email,
// //       rawIssueText: text,
// //       humanApproved: false,
// //       requiresHumanReview: false,
// //     };

// //     // Invoke the freshly compiled instance safely
// //     const finalState = await this.compiledGraph.invoke(initialState, config);

// //     const threadDetails = await this.compiledGraph.getState(config);
// //     const isPaused = threadDetails.next.length > 0;

// //     return {
// //       ticketId,
// //       currentState: finalState,
// //       status: isPaused ? 'pending_approval' : 'resolved',
// //     };
// //   }

// //   /**
// //    * Fetches the current snapshot variables stored inside a thread checkpoint.
// //    */
// //   async getGraphStateSnapshot(ticketId: string) {
// //     const config = { configurable: { thread_id: ticketId } };
// //     const snapshot = await this.compiledGraph.getState(config);
// //     return snapshot.values;
// //   }

// //   /**
// //    * Human-In-The-Loop Controller: Modifies the frozen state and resumes execution paths.
// //    */
// //   async approveAndResumeWorkflow(ticketId: string, overriddenDraft: string) {
// //     console.log(
// //       `[AgentService] Human approved draft for ticket: ${ticketId}. Overriding state variables and unpausing...`,
// //     );

// //     const config = { configurable: { thread_id: ticketId } };

// //     // 1. Interpolate state variables directly into the frozen graph memory ledger
// //     await this.compiledGraph.updateState(config, {
// //       draftResponse: overriddenDraft,
// //       humanApproved: true,
// //     });

// //     // 2. Resume execution
// //     const resumedState = await this.compiledGraph.invoke(null, config);

// //     return {
// //       ticketId,
// //       currentState: resumedState,
// //       status: 'resolved',
// //     };
// //   }

// //   async rejectAndTerminateWorkflow(ticketId: string) {
// //     console.log(
// //       `[AgentService] Human rejected workflow for ticket: ${ticketId}. Evicting active checkpoint...`,
// //     );

// //     const config = { configurable: { thread_id: ticketId } };

// //     // Update the state ledger to record the explicit rejection context
// //     await this.compiledGraph.updateState(config, {
// //       criticFeedback: 'Workflow explicitly terminated by human operator.',
// //       qualityPassed: false,
// //     });

// //     // We do NOT resume the graph with invoke(null).
// //     // We leave the state frozen at the checkpoint line or discard it, forcing the status to terminal.
// //     return {
// //       ticketId,
// //       status: 'rejected',
// //     };
// //   }
// // }

// // src/agent/agent.service.ts
// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { MemorySaver } from '@langchain/langgraph';
// import { crmAgentWorkflow } from './agent.engine';
// import { AgentStateInterface } from './agent.state';
// import { KnowledgeService } from '../knowledge/knowledge.service'; // Fixed absolute path mapping resolution

// @Injectable()
// export class AgentService implements OnModuleInit {
//   private checkpointer = new MemorySaver();

//   // Explicitly typing our compiled graph property
//   private compiledGraph!: ReturnType<typeof crmAgentWorkflow.compile>;

//   constructor(private readonly knowledgeService: KnowledgeService) {}

//   onModuleInit() {
//     // Compile the workflow layout, telling it to pause right before the human_review node
//     this.compiledGraph = crmAgentWorkflow.compile({
//       checkpointer: this.checkpointer,
//       interruptBefore: ['human_review'],
//     });
//   }

//   /**
//    * Spawns a brand new LangGraph execution thread from an inbound customer email.
//    */
//   async triggerInboundWorkflow(ticketId: string, email: string, text: string) {
//     console.log(
//       `[AgentService] Starting new asynchronous workflow thread for ticket: ${ticketId}`,
//     );

//     // Provide the dynamic dependency references via runtime configurations context
//     const config = {
//       configurable: {
//         thread_id: ticketId,
//         knowledgeService: this.knowledgeService, // Injected cleanly here
//       },
//     };

//     const initialState: Partial<AgentStateInterface> = {
//       ticketId,
//       customerEmail: email,
//       rawIssueText: text,
//       humanApproved: false,
//       requiresHumanReview: false,
//     };

//     // Invoke the freshly compiled instance safely
//     const finalState = await this.compiledGraph.invoke(initialState, config);

//     const threadDetails = await this.compiledGraph.getState(config);
//     const isPaused = threadDetails.next.length > 0;

//     return {
//       ticketId,
//       currentState: finalState,
//       status: isPaused ? 'pending_approval' : 'resolved',
//     };
//   }

//   /**
//    * Fetches the current snapshot variables stored inside a thread checkpoint.
//    */
//   async getGraphStateSnapshot(ticketId: string) {
//     const config = { configurable: { thread_id: ticketId } };
//     const snapshot = await this.compiledGraph.getState(config);
//     return snapshot.values;
//   }

//   /**
//    * Human-In-The-Loop Controller: Modifies the frozen state and resumes execution paths.
//    */
//   async approveAndResumeWorkflow(ticketId: string, overriddenDraft: string) {
//     console.log(
//       `[AgentService] Human approved draft for ticket: ${ticketId}. Overriding state variables and unpausing...`,
//     );

//     const config = {
//       configurable: {
//         thread_id: ticketId,
//         knowledgeService: this.knowledgeService,
//       },
//     };

//     // 1. Interpolate state variables directly into the frozen graph memory ledger
//     await this.compiledGraph.updateState(config, {
//       draftResponse: overriddenDraft,
//       humanApproved: true,
//     });

//     // 2. Resume execution
//     const resumedState = await this.compiledGraph.invoke(null, config);

//     return {
//       ticketId,
//       currentState: resumedState,
//       status: 'resolved',
//     };
//   }

//   /**
//    * Human-In-The-Loop Controller: Force terminates an active checkpoint thread.
//    */
//   async rejectAndTerminateWorkflow(ticketId: string) {
//     console.log(
//       `[AgentService] Human rejected workflow for ticket: ${ticketId}. Evicting active checkpoint...`,
//     );

//     const config = { configurable: { thread_id: ticketId } };

//     // Update the state ledger to record the explicit rejection context
//     await this.compiledGraph.updateState(config, {
//       criticFeedback: 'Workflow explicitly terminated by human operator.',
//       qualityPassed: false,
//     });

//     return {
//       ticketId,
//       status: 'rejected',
//     };
//   }
// }

// src/agent/agent.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { crmAgentWorkflow } from './agent.engine';
import { AgentStateInterface } from './agent.state';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class AgentService implements OnModuleInit, OnModuleDestroy {
  // Replace the volatile MemorySaver instance with a stateless PostgresSaver reference
  private checkpointer!: PostgresSaver;
  private compiledGraph!: ReturnType<typeof crmAgentWorkflow.compile>;

  constructor(private readonly knowledgeService: KnowledgeService) {}

  async onModuleInit() {
    // 1. Build a connection string utilizing your existing environment configurations
    const connectionString = `postgres://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_DATABASE || 'langgraph_crm'}`;

    console.log(
      '[AgentService] Initializing persistent PostgreSQL LangGraph checkpointer pool...',
    );

    // 2. Initialize the Postgres saver pool
    this.checkpointer = PostgresSaver.fromConnString(connectionString);

    // 3. Ensure internal checkpoint tracking schemas are fully provisioned on boot
    await this.checkpointer.setup();

    // 4. Compile the workflow layout, binding our durable database saver
    this.compiledGraph = crmAgentWorkflow.compile({
      checkpointer: this.checkpointer,
      interruptBefore: ['human_review'],
    });

    console.log(
      '[AgentService] Persistent workflow engine compilation finalized successfully.',
    );
  }

  async onModuleDestroy() {
    // Gracefully terminate connection pools if the NestJS app shuts down
    if (this.checkpointer) {
      await this.checkpointer.end();
      console.log('[AgentService] PostgreSQL checkpoint thread pool closed.');
    }
  }

  /**
   * Spawns a brand new LangGraph execution thread from an inbound customer email.
   */
  async triggerInboundWorkflow(ticketId: string, email: string, text: string) {
    console.log(
      `[AgentService] Starting new asynchronous workflow thread for ticket: ${ticketId}`,
    );

    const config = {
      configurable: {
        thread_id: ticketId,
        knowledgeService: this.knowledgeService,
      },
    };

    const initialState: Partial<AgentStateInterface> = {
      ticketId,
      customerEmail: email,
      rawIssueText: text,
      humanApproved: false,
      requiresHumanReview: false,
    };

    const finalState = await this.compiledGraph.invoke(initialState, config);

    const threadDetails = await this.compiledGraph.getState(config);
    const isPaused = threadDetails.next.length > 0;

    return {
      ticketId,
      currentState: finalState,
      status: isPaused ? 'pending_approval' : 'resolved',
    };
  }

  /**
   * Fetches the current snapshot variables stored inside a thread checkpoint.
   */
  async getGraphStateSnapshot(ticketId: string) {
    const config = { configurable: { thread_id: ticketId } };
    const snapshot = await this.compiledGraph.getState(config);
    return snapshot.values;
  }

  /**
   * Human-In-The-Loop Controller: Modifies the frozen state and resumes execution paths.
   */
  async approveAndResumeWorkflow(ticketId: string, overriddenDraft: string) {
    console.log(
      `[AgentService] Human approved draft for ticket: ${ticketId}. Overriding state variables and unpausing...`,
    );

    const config = {
      configurable: {
        thread_id: ticketId,
        knowledgeService: this.knowledgeService,
      },
    };

    // Interpolate state variables directly into the durable database memory ledger
    await this.compiledGraph.updateState(config, {
      draftResponse: overriddenDraft,
      humanApproved: true,
    });

    // Resume execution from the checkpoint row state
    const resumedState = await this.compiledGraph.invoke(null, config);

    return {
      ticketId,
      currentState: resumedState,
      status: 'resolved',
    };
  }

  /**
   * Human-In-The-Loop Controller: Force terminates an active checkpoint thread.
   */
  async rejectAndTerminateWorkflow(ticketId: string) {
    console.log(
      `[AgentService] Human rejected workflow for ticket: ${ticketId}. Recording feedback state...`,
    );

    const config = { configurable: { thread_id: ticketId } };

    await this.compiledGraph.updateState(config, {
      criticFeedback: 'Workflow explicitly terminated by human operator.',
      qualityPassed: false,
    });

    return {
      ticketId,
      status: 'rejected',
    };
  }
}
