import type { Database, EpisodeRow } from "./types/database.types";

type Table = Database["public"]["Tables"]["episodes"];

type MappedInsert = {
  [K in Exclude<keyof EpisodeRow, "id" | "created_at" | "updated_at">]: EpisodeRow[K];
};

type IsInsertSame = Table["Insert"] extends MappedInsert ? true : false;
type IsMappedInsertSame = MappedInsert extends Table["Insert"] ? true : false;

const test11: IsInsertSame = true;
const test12: IsMappedInsertSame = true;
