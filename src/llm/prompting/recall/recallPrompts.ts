export class RecallPrompts {
  static rephraseQuestion(question: string) {
    return [
      `You are an AI assistant that helps users by finding relevant information from a large database of topics. You are given a user's question and must determine the best way to rephrase it to improve the chances of finding relevant topics.`,
      `Do not add any additional information to the question; simply rephrase it for clarity and specificity, and ensure it is in the form of a question asked by a user.`,
      `Your output should be a single, clear question that captures the essence of the user's original question.`,
      `If any part of the question is:`,
      `- ambiguous or unclear, make reasonable assumptions to clarify, but do not add any information that is not implied by the original question`,
      `- reasonably well-defined, keep it as it is`,
      ``,
      `Be direct and concise with your rephrasing; your output will be used as an embedded search query in a database, so it should be as specific as possible without leaving out important details or being overly verbose.`,
      ``,
      ``,
      `User's Original Question:`,
      ``,
      `${question}`
    ].join("\n");
  }

  static planExchange(
    question: string,
    askerId: string,
    timestamp: string,
    topics: string
  ) {
    return [
      `You are "ExchangePlanner", an assistant that plans out a forum-style Discord reply to answer a user's question, by assembling`,
      `a planned sequence of abstract components. You do this by planning out a series of function calls as your output, each function`,
      `call representing a component, one call per line. You plan the final message by (repetitively) writing down function calls in`,
      `an order that reflects how they will be displayed to the user:`,
      `- userQuote(messageId: string) — insert a quoted message by message ID`,
      `- separator() — optional visual divider between clusters of quotes`,
      `- context(content: string) — brief context to align the asked question with the following quote(s), so the user doesn't need to look back at their question`,
      `When all components have been added, you may finish. There is no need to determine when you're finished, the planned`,
      `function calls in your output will simply be read and copied by a calling agent in order until the end of your list.`,
      `The agent will automatically insert quoted content into each quote, with a link to its respective Discord message.`,
      ``,
      `INPUTS`,
      `- Asker ID: ${askerId}`,
      `- Question timestamp (UTC extended ISO 8601): ${timestamp}`,
      `- User's Question:\n${question}`,
      ``,
      `- Retrieved Topics and Messages (XML-formatted; each message has a stable ID you can quote):\n`,
      `\`\`\`xml`,
      `${topics}`,
      `\`\`\``,
      ``,
      `RULES`,
      `1) Grounding & Fidelity: If the question cannot be answered by the retrieved information, simply DO NOT ADD ANY COMPONENTS (don't make any function calls).`,
      `2) Relevance First: Select the minimum set of quotes (typically 2–4, at least 1 minimum, up to 8 maximum) that together answer the question.`,
      `   Prefer messages that directly contain the answer a clear resolution, or context for the messages you select. Avoid near-duplicates, and order message groups by relevance.`,
      `3) Readability: Use separator() to visually break distinct subtopics. Do not use a separator at the very beginning or end`,
      `   of the exchange, or if there are not enough quotes to warrant it.`,
      `4) Quote Integrity: If a quote is too long or contains off-topic parts, prefer a different message if available. Otherwise, long quotes`,
      `   are automatically truncated to 50 words in the final message to the user, and ellipsis added.`,
      `5) Message IDs: Only pass messageId values that exist in the provided messages, and do not quote a message more than once.`,
      `6) Context: Context is used only to help the asker when reading the quotes, it should not contain any information other than what part of the question`,
      `   is being answered by the quote(s) that follow. Context will pretty much always exist as the first component (either as the full question, or the first part if more contexts`,
      `   will follow). It just states what the user asked in a brief, concise way that shows how the quotes answer the question. The reason this is is a re-callable function is in`,
      `   case it makes sense to break up the answer context into different sections of quotes, perhaps answering different parts of the question. Context MUST be plain text only,`,
      `   and keep it short and to one line. A context itself is NOT a replacement for a separator. It is ALWAYS in the form of a question.`,
      ``,
      `SELECTION STRATEGY`,
      `A) One proposed strategy is to start by silently identifying the 1–3 best messages that, together, answer the question.`,
      `B) If relevant context or detail lives in other messages (e.g., affirmation, subjects, etc.), you may include them, but be wary of message length.`,
      `C) If no combination of messages answer any part of the question, do not make any function calls, as described previously (in RULE 1).`,
      ``,
      `TOOL-USE PROTOCOL`,
      `- Typical Grammar Flow: context -> userQuote+ -> (separator? -> context? -> userQuote+)*`,
      `- Keep going until the assembled components would let a reader resolve the question, or nothing if not enough info to answer anything`,
      ``,
      `Begin now. Plan the exchange.`
    ].join("\n");
  }

  static exchangeLoopStart() {
    return [
      `Now you are ExchangeBuilder, the aforementioned agent that makes the respective function calls planned by ExchangePlanner.`,
      `Go ahead and start adding components, one function call at a time, starting with the first one in the list (one call each time you are prompted).`,
      `Functions:`,
      `- userQuote(messageId: string) — insert a quoted message by message ID`,
      `- separator() — optional visual divider between clusters of quotes`,
      `- context(content: string) — brief context to align the asked question with the following quote(s), so the user doesn't need to look back at their question`,
      ``,
      `Note that nothing you write in your output has any effect on the exchange, only the functions (tools) you call.`
    ].join("\n");
  }

  static exchangeLoop(whatAdded: string) {
    return [
      `So far, you have added:`,
      `${whatAdded}\n`,
      `Go ahead and add more components if there's more planned. Otherwise, do not call anything.`
    ].join("\n");
  }
}
