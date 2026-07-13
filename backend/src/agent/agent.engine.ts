import { GoogleGenAI, Type, Schema } from '@google/genai';
import { StateGraph } from '@langchain/langgraph';
import { AgentStateAnnotation } from './agent.state';
import { RunnableConfig } from '@langchain/core/runnables';
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function classificationNode(
  state: typeof AgentStateAnnotation.State,
) {
  console.log(`[Node: Classifier] Reviewing ticket ID: ${state.ticketId}`);

  const classificationSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      categories: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'Tags matching user intent. Allowed values: Technical, Billing, General_Inquiry',
      },
      sentiment: {
        type: Type.STRING,
        enum: ['URGENT_CHURN', 'ANGRY', 'NEUTRAL'],
        description: 'Emotional urgency tier of the customer communication',
      },
    },
    required: ['categories', 'sentiment'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: `Analyze this inbound customer support ticket and classify its attributes accurately:\n\n"${state.rawIssueText}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: classificationSchema,
      temperature: 0.1,
    },
  });

  const structuredData = JSON.parse(response.text || '{}');

  const requiresHumanReview =
    structuredData.sentiment === 'URGENT_CHURN' ||
    structuredData.sentiment === 'ANGRY';

  return {
    categories: structuredData.categories || ['General_Inquiry'],
    sentiment: structuredData.sentiment || 'NEUTRAL',
    requiresHumanReview,
  };
}

/**
 * Node 2: Dynamic Semantic Vector RAG Researcher Worker
 * Extracts KnowledgeService from the execution context, computes vector distances
 * inside PostgreSQL, and hydates the context stream.
 */
export async function researchWorkerNode(
  state: typeof AgentStateAnnotation.State,
  config?: RunnableConfig,
) {
  console.log(
    `[Node: Research_Worker] Performing live vector RAG search for ticket: ${state.ticketId}`,
  );

  // Extract the stateless NestJS KnowledgeService instance out of the execution configuration
  const knowledgeService = config?.configurable?.knowledgeService;
  let retrievedContextChunks: string[] = [];
  let stripeAccountStatus = 'No linked invoicing parameters found.';

  if (knowledgeService) {
    // Run true mathematical pgvector similarity comparisons
    retrievedContextChunks = await knowledgeService.findRelevantContext(
      state.rawIssueText,
      state.categories,
      2,
    );
  } else {
    console.warn(
      `[Node: Research_Worker] KnowledgeService context missing! Falling back to empty array.`,
    );
  }

  // Handle runtime mock database checks for billing profiles
  if (state.categories.includes('Billing')) {
    stripeAccountStatus =
      'ACTIVE_PREMIUM_TIER. Outstanding dispute mismatch: pending $50 invoice credit correction pending manual ledger update.';
  }

  return {
    retrievedContextChunks,
    stripeAccountStatus,
  };
}

export async function responseComposerNode(
  state: typeof AgentStateAnnotation.State,
) {
  console.log(
    `[Node: Response_Composer] Synthesizing final contextual communication draft...`,
  );

  const prompt = `
    You are an automated premium support agent for an enterprise B2B collaboration platform. 
    Draft a polite response addressing the customer's issues.
    
    CUSTOMER ISSUE: "${state.rawIssueText}"
    INTERNAL KNOWLEDGE BASE DATA: "${state.retrievedContextChunks.join('\n')}"
    CUSTOMER ACCOUNT/BILLING RECORDS: "${state.stripeAccountStatus}"
    
    CRITICAL COMPLIANCE RULES:
    1. If technical documentation is provided, give explicit, actionable advice based strictly on those specs.
    2. If billing records indicate a credit or adjustment error, explicitly acknowledge it and state that it is being credited or adjusted back to zero.
    3. Maintain an empathetic, highly professional, non-defensive corporate tone.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: prompt,
    config: {
      temperature: 0.5,
    },
  });

  return {
    draftResponse:
      response.text ||
      'Our engineering managers are investigating your configuration profile manually.',
  };
}

export async function humanReviewPlaceholderNode(
  state: typeof AgentStateAnnotation.State,
) {
  console.log(
    `[Node: Human_Review] Policy checked. Resuming terminal completion.`,
  );
  return {};
}

// Build the functional flow schema blueprint layout
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode('classifier', classificationNode)
  .addNode('researcher', researchWorkerNode)
  .addNode('composer', responseComposerNode)
  .addNode('human_review', humanReviewPlaceholderNode)

  .addEdge('__start__', 'classifier')
  .addEdge('classifier', 'researcher')
  .addEdge('researcher', 'composer');

workflow.addConditionalEdges(
  'composer',
  (state): 'human_review' | '__end__' => {
    if (state.requiresHumanReview && !state.humanApproved) {
      console.log(
        `[Graph Conditional Edge] Intercept rule matched. Routing execution to pause boundary.`,
      );
      return 'human_review';
    }
    return '__end__';
  },
);

workflow.addEdge('human_review', '__end__');

export const crmAgentWorkflow = workflow;
