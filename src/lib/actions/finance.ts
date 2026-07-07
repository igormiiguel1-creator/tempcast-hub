"use server";

import { createClient } from "@supabase/supabase-js";
import { financeEntries as mockEntries } from "@/features/production/mock-data";
import type { FinanceEntry } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToEntry(row: any): FinanceEntry {
  return {
    id: row.id,
    title: row.title,
    type: row.type as FinanceEntry["type"],
    category: row.category ?? "",
    amount: row.amount,
    date: row.date,
    note: row.note ?? "",
  };
}

export async function getFinanceEntries(workspaceId = DEFAULT_WORKSPACE): Promise<FinanceEntry[]> {
  const supabase = getServerClient();
  if (!supabase) return mockEntries;

  const { data, error } = await supabase
    .from("finance_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: false });

  if (error || !data) return mockEntries;
  return data.map(dbToEntry);
}

export async function createFinanceEntry(input: Omit<FinanceEntry, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<FinanceEntry> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("finance_entries")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      type: input.type,
      category: input.category || null,
      amount: input.amount,
      date: input.date,
      note: input.note || null,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToEntry(data);
}

export async function updateFinanceEntry(id: number, updates: Partial<FinanceEntry>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.note !== undefined) dbUpdates.note = updates.note;

  await supabase
    .from("finance_entries")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deleteFinanceEntry(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("finance_entries")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function getFinanceSummary(workspaceId = DEFAULT_WORKSPACE): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}> {
  const entries = await getFinanceEntries(workspaceId);

  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace(/[€\s.]/g, "").replace(",", ".")) || 0;
  };

  const totalIncome = entries
    .filter((e) => e.type === "Income")
    .reduce((sum, e) => sum + parseAmount(e.amount), 0);

  const totalExpenses = entries
    .filter((e) => e.type === "Expense")
    .reduce((sum, e) => sum + parseAmount(e.amount), 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}
