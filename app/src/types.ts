export type TaskQuadrant =
  | "urgentImportant"
  | "notUrgentImportant"
  | "urgentNotImportant"
  | "notUrgentNotImportant";

export interface Task {
  id: string;
  title: string;
  description: string;
  urgency: number;
  importance: number;
  score: number;
  quadrant: TaskQuadrant;
  autoAssigned: boolean;
  createdAt: number;
}

export interface InstructionalRulesetState {
  raw: string;
  markdown: string;
  updatedAt: number | null;
}

export interface KnowledgeChunkMetadata {
  chunkId: string;
  start: number;
  end: number;
  tokenEstimate: number;
  createdAt: number;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: KnowledgeChunkMetadata;
}

export interface KnowledgeCompendiumState {
  raw: string;
  chunks: KnowledgeChunk[];
  format: "json" | "jsonl";
  chunkSize: number;
  updatedAt: number | null;
}
