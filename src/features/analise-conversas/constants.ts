/** Mínimo de mensagens para a análise fazer sentido. */
export const MIN_MESSAGES = 10;

/** Pausa a partir da qual a mensagem seguinte conta como início de nova conversa. */
export const CONVERSATION_GAP_HOURS = 6;

/** Respostas mais lentas do que isto são pausas (ex.: noite), e não tempo de resposta. */
export const MAX_RESPONSE_HOURS = 12;

/** Janela para considerar que uma mensagem ficou sem resposta. */
export const UNANSWERED_WINDOW_HOURS = 24;

export const TOP_WORDS_LIMIT = 10;

/** Palavras frequentes em português e inglês que não dizem nada sobre a conversa. */
export const STOPWORDS = new Set<string>([
  // português
  "para", "pra", "pro", "com", "sem", "uma", "uns", "umas", "dos", "das", "nos", "nas",
  "que", "mas", "por", "pelo", "pela", "isso", "isto", "aquilo", "esse", "essa", "este",
  "esta", "esses", "essas", "estes", "estas", "aquele", "aquela", "meu", "minha", "teu",
  "tua", "seu", "sua", "nosso", "nossa", "eles", "elas", "voce", "você", "vocês", "vcs",
  "vc", "ele", "ela", "mim", "ti", "tambem", "também", "muito", "muita", "muitos", "muitas",
  "mais", "menos", "pouco", "pouca", "como", "quando", "onde", "porque", "porquê", "então",
  "entao", "ainda", "já", "agora", "aqui", "ali", "lá", "tudo", "nada", "algo", "alguém",
  "ser", "estar", "está", "estou", "estás", "estão", "são", "foi", "sou", "vai", "vou",
  "tenho", "tem", "tinha", "tava", "tá", "ter", "fazer", "faz", "fiz", "ver", "ir",
  "nao", "não", "sim", "bem", "mal", "sei", "acho", "tipo", "pois", "ainda", "também",
  "tbm", "pq", "oque", "assim", "depois", "antes", "sobre", "entre", "pode", "posso",
  "quer", "quero", "dia", "hoje", "amanha", "amanhã", "ontem",
  // inglês
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "had", "her",
  "was", "one", "our", "out", "get", "has", "him", "his", "how", "its", "let", "may",
  "new", "now", "see", "two", "who", "did", "yes", "too", "use", "that", "with", "have",
  "this", "will", "your", "from", "they", "know", "want", "been", "good", "much", "some",
  "very", "when", "come", "here", "just", "like", "make", "many", "more", "only", "over",
  "such", "take", "than", "them", "well", "were", "what", "about", "would", "there",
  "their", "which", "could", "other", "after", "first", "never", "these", "think", "where",
  "being", "also", "back", "even", "most", "really", "going", "dont", "cant", "wont",
  "didn", "don", "isn", "im", "thats",
]);
