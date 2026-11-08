import { test } from "node:test";
import assert from "node:assert/strict";
import type { ChatMessage, MessageKind } from "../types";
import { analyseConversation, getAnalysisError } from "./conversation-analysis.service";

type Stamp = [year: number, month: number, day: number, hour: number, minute: number];

function message(sender: string, [y, mo, d, h, mi]: Stamp, text: string, kind: MessageKind = "text"): ChatMessage {
  return { sender, text, kind, timestamp: new Date(y, mo - 1, d, h, mi) };
}

test("calcula contagens, partilhas, tempos de resposta e inícios de conversa", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 10, 0], "bom dia"),
    message("Rui", [2024, 3, 1, 10, 10], "bom dia, tudo bem?"),
    message("Ana", [2024, 3, 1, 10, 30], "tudo sim"),
    message("Rui", [2024, 3, 1, 11, 0], "tudo"),
  ];

  const analysis = analyseConversation(messages);
  const ana = analysis.participants.find((p) => p.name === "Ana");
  const rui = analysis.participants.find((p) => p.name === "Rui");

  assert.ok(ana && rui);
  assert.equal(analysis.totalMessages, 4);
  assert.equal(analysis.isDirect, true);
  assert.equal(ana.messageCount, 2);
  assert.equal(ana.messageShare, 0.5);

  // Rui respondeu em 10 min e 30 min (mediana 20); Ana respondeu em 20 min.
  assert.deepEqual([rui.responseCount, rui.medianResponseMinutes, rui.averageResponseMinutes], [2, 20, 20]);
  assert.deepEqual([ana.responseCount, ana.medianResponseMinutes], [1, 20]);

  assert.equal(analysis.totalConversationStarts, 1);
  assert.equal(ana.conversationStarts, 1);
  assert.equal(rui.conversationStarts, 0);
  assert.equal(analysis.activeDays, 1);
  assert.equal(analysis.spanDays, 1);
});

test("ignora respostas com mais de 12 h e conta silêncios de 24 h", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 8, 0], "oi"),
    message("Rui", [2024, 3, 1, 8, 5], "oi"),
    message("Ana", [2024, 3, 1, 9, 0], "vais responder?"),
    // 49 h depois: pausa longa, não é tempo de resposta, e Rui não respondeu em 24 h.
    message("Rui", [2024, 3, 3, 10, 0], "desculpa"),
  ];

  const analysis = analyseConversation(messages);
  const ana = analysis.participants.find((p) => p.name === "Ana");
  const rui = analysis.participants.find((p) => p.name === "Rui");

  assert.ok(ana && rui);
  assert.equal(rui.responseCount, 1);
  assert.equal(rui.medianResponseMinutes, 5);
  assert.equal(ana.responseCount, 1);
  assert.equal(ana.medianResponseMinutes, 55);

  assert.equal(rui.unansweredCount, 1);
  assert.equal(ana.unansweredCount, 0);
  assert.equal(rui.conversationStarts, 1);
  assert.equal(analysis.totalConversationStarts, 2);
  assert.equal(analysis.activeDays, 2);
  assert.equal(analysis.spanDays, 3);
});

test("não conta como sem resposta uma mensagem cuja janela de 24 h ainda não terminou", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 8, 0], "oi"),
    message("Rui", [2024, 3, 1, 8, 5], "olá"),
    message("Ana", [2024, 3, 1, 20, 0], "ainda aí?"),
  ];

  const analysis = analyseConversation(messages);
  assert.equal(analysis.participants.find((p) => p.name === "Rui")?.unansweredCount, 0);
  assert.equal(analysis.participants.find((p) => p.name === "Ana")?.unansweredCount, 0);
});

test("não tem contagem de sem resposta em conversas de grupo", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 8, 0], "oi"),
    message("Rui", [2024, 3, 1, 8, 5], "olá"),
    message("Bia", [2024, 3, 1, 8, 6], "boas"),
  ];

  const analysis = analyseConversation(messages);
  assert.equal(analysis.isDirect, false);
  assert.ok(analysis.participants.every((p) => p.unansweredCount === null));
});

test("conta mensagens apagadas, comprimento médio e mensagem mais longa sem contar media", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 8, 0], "um dois três quatro"),
    message("Ana", [2024, 3, 1, 8, 1], "", "media"),
    message("Ana", [2024, 3, 1, 8, 2], "", "deleted"),
    message("Rui", [2024, 3, 1, 8, 3], "sim"),
  ];

  const analysis = analyseConversation(messages);
  const ana = analysis.participants.find((p) => p.name === "Ana");

  assert.ok(ana);
  assert.equal(ana.deletedCount, 1);
  assert.equal(ana.averageWordsPerMessage, 4);
  assert.equal(ana.longestMessage?.words, 4);
  assert.equal(ana.longestMessage?.text, "um dois três quatro");
});

test("lista palavras mais usadas sem stopwords, risadas nem números", () => {
  const messages = [
    message("Ana", [2024, 3, 1, 8, 0], "Hoje vou ao cinema, cinema é fixe kkkkk 123"),
    message("Ana", [2024, 3, 1, 8, 1], "estou muito cansado"),
    message("Rui", [2024, 3, 1, 8, 2], "cinema!! fixe mesmo"),
  ];

  const analysis = analyseConversation(messages);
  const ana = analysis.participants.find((p) => p.name === "Ana");

  assert.ok(ana);
  assert.deepEqual(
    ana.topWords.map((entry) => entry.word),
    ["cinema", "cansado", "fixe"],
  );
  assert.equal(ana.topWords[0].count, 2);
});

test("ordena participantes pelo número de mensagens", () => {
  const messages = [
    message("Rui", [2024, 3, 1, 8, 0], "a"),
    message("Ana", [2024, 3, 1, 8, 1], "b"),
    message("Ana", [2024, 3, 1, 8, 2], "c"),
  ];

  const analysis = analyseConversation(messages);
  assert.deepEqual(
    analysis.participants.map((p) => p.name),
    ["Ana", "Rui"],
  );
});

test("getAnalysisError distingue formato, poucas mensagens e só uma pessoa", () => {
  assert.equal(getAnalysisError([]), "unrecognised-format");

  const few = Array.from({ length: 3 }, (_, i) => message(i % 2 ? "Ana" : "Rui", [2024, 3, 1, 8, i], "oi"));
  assert.equal(getAnalysisError(few), "too-few-messages");

  const solo = Array.from({ length: 12 }, (_, i) => message("Ana", [2024, 3, 1, 8, i % 60], "oi"));
  assert.equal(getAnalysisError(solo), "single-participant");

  const valid = Array.from({ length: 12 }, (_, i) => message(i % 2 ? "Ana" : "Rui", [2024, 3, 1, 8, i % 60], "oi"));
  assert.equal(getAnalysisError(valid), null);
});
