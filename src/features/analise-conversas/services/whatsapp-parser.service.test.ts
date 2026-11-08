import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWhatsAppExport, tokenise } from "./whatsapp-parser.service";

test("lê o formato Android de 24 horas, ignora mensagens de sistema e junta linhas", () => {
  const raw = [
    "12/03/2024, 22:15 - As mensagens e chamadas são protegidas com encriptação de ponta a ponta.",
    "12/03/2024, 22:16 - Ana: Olá",
    "tudo bem?",
    "12/03/2024, 22:20 - Rui: <Multimédia omitido>",
    "12/03/2024, 22:21 - Ana: Esta mensagem foi apagada",
  ].join("\n");

  const messages = parseWhatsAppExport(raw);

  assert.equal(messages.length, 3);
  assert.equal(messages[0].sender, "Ana");
  assert.equal(messages[0].text, "Olá\ntudo bem?");
  assert.equal(messages[0].kind, "text");
  assert.equal(messages[1].kind, "media");
  assert.equal(messages[2].kind, "deleted");
  assert.equal(messages[0].timestamp.getHours(), 22);
  assert.equal(messages[0].timestamp.getMinutes(), 16);
});

test("lê o formato iOS com parênteses retos, segundos, marcas invisíveis e prefixo ~", () => {
  const raw = [
    "‎[12/03/24, 10:15:03] Ana: Oi",
    "[12/03/24, 10:16:00] ~ Rui: Olá",
    "[12/03/24, 10:17:30] Ana: <attached: 00000012-PHOTO.jpg>",
  ].join("\n");

  const messages = parseWhatsAppExport(raw);

  assert.equal(messages.length, 3);
  assert.equal(messages[0].sender, "Ana");
  assert.equal(messages[1].sender, "Rui");
  assert.equal(messages[2].kind, "media");
  assert.equal(messages[0].timestamp.getSeconds(), 3);
  assert.equal(messages[0].timestamp.getFullYear(), 2024);
});

test("converte horas em formato de 12 horas", () => {
  const raw = [
    "12/03/2024, 10:15 PM - Ana: boa noite",
    "12/03/2024, 12:05 AM - Rui: madrugada",
  ].join("\n");

  const [night, early] = parseWhatsAppExport(raw);

  assert.equal(night.timestamp.getHours(), 22);
  assert.equal(early.timestamp.getHours(), 0);
});

test("usa dia/mês por defeito e detecta mês/dia quando um valor passa de 12", () => {
  const portuguese = parseWhatsAppExport("05/03/2024, 09:00 - Ana: x");
  assert.equal(portuguese[0].timestamp.getMonth(), 2);
  assert.equal(portuguese[0].timestamp.getDate(), 5);

  const american = parseWhatsAppExport(
    ["03/25/2024, 10:15 - Ana: hi", "03/26/2024, 10:20 - Rui: hey"].join("\n"),
  );
  assert.equal(american[0].timestamp.getMonth(), 2);
  assert.equal(american[0].timestamp.getDate(), 25);
});

test("descarta datas impossíveis em vez de as corrigir silenciosamente", () => {
  const messages = parseWhatsAppExport("31/02/2024, 09:00 - Ana: impossível");
  assert.equal(messages.length, 0);
});

test("tokenise separa por pontuação, emojis e números e remove URLs e marcadores", () => {
  assert.deepEqual(tokenise("Vi https://exemplo.pt/abc filme 😂 123, fixe!"), ["vi", "filme", "fixe"]);
  assert.deepEqual(tokenise("<Multimédia omitido> vou ver"), ["vou", "ver"]);
});
