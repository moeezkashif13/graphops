const ELI5_DICTIONARY: Record<string, string> = {
  "Analyzing State Checkpoint for Thread Context":
    "🔍 AI is looking over the customer's request to understand exactly what they need help with.",
  "Extracted Metadata Categories":
    "🏷️ AI read the message and automatically sorted it under topics like",
  "Sentiment Evaluated":
    "🧠 AI checked the tone of the message and found that the customer is feeling",
  "Condition Target Met: [requiresHumanReview = true] -> Graph Execution Interrupted. Awaiting human input.":
    "⚠️ This looks like a high priority or sensitive issue! The AI paused itself and is waiting for you to double-check its work before sending a reply.",
  "Graph processing successfully finalized.":
    "✅ Everything looks good! The automated process completed perfectly.",
  "Select an inbound queue option to unpack execution logs...":
    "📥 Pick a customer ticket from the left sidebar to see the AI step into action!",
  // Catch custom background text or vector DB triggers mentioned in your app
  "Executing cosine distance queries against pgvector database using text-embedding-004":
    "📖 AI is searching our historical company knowledge base to see if we've successfully resolved a similar problem before.",
};

export function translateLogToEli5(technicalLog: string): string {
  // Check for partial structural matches (e.g. logs with dynamic text at the end)
  const matchingKey = Object.keys(ELI5_DICTIONARY).find((key) =>
    technicalLog.includes(key),
  );

  if (matchingKey) {
    let baseTranslation = ELI5_DICTIONARY[matchingKey];

    // Dynamically append extracted categories/sentiments clean text if they exist in the raw string
    if (matchingKey.includes("Extracted Metadata Categories")) {
      const match = technicalLog.match(/\[(.*?)\]/);
      return `${baseTranslation} ${match ? match[0] : "General Topics"}.`;
    }
    if (matchingKey.includes("Sentiment Evaluated")) {
      const parts = technicalLog.split(":");
      const sentiment = parts[1]?.trim() || "Neutral";
      return `${baseTranslation} **${sentiment.toUpperCase()}**.`;
    }
    return baseTranslation;
  }

  return technicalLog;
}
