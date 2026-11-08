export type MessageKind = "text" | "media" | "deleted";

export type ChatMessage = {
  timestamp: Date;
  sender: string;
  text: string;
  kind: MessageKind;
};

export type AnalysisError = "unrecognised-format" | "too-few-messages" | "single-participant";

export type LongestMessage = {
  text: string;
  words: number;
  timestamp: Date;
};

export type WordCount = {
  word: string;
  count: number;
};

export type ParticipantStats = {
  name: string;
  messageCount: number;
  /** Fração do total de mensagens, entre 0 e 1. */
  messageShare: number;
  averageWordsPerMessage: number;
  deletedCount: number;
  responseCount: number;
  averageResponseMinutes: number | null;
  medianResponseMinutes: number | null;
  conversationStarts: number;
  /** Só existe em conversas entre duas pessoas. */
  unansweredCount: number | null;
  longestMessage: LongestMessage | null;
  topWords: WordCount[];
};

export type ConversationAnalysis = {
  totalMessages: number;
  firstMessageAt: Date;
  lastMessageAt: Date;
  /** Dias de calendário distintos com pelo menos uma mensagem. */
  activeDays: number;
  /** Dias de calendário entre a primeira e a última mensagem, inclusive. */
  spanDays: number;
  totalConversationStarts: number;
  isDirect: boolean;
  /** Ordenados por número de mensagens, do maior para o menor. */
  participants: ParticipantStats[];
};
