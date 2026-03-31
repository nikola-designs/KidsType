import type { Stroke } from "@/lib/drawing-engine/types";
import type { TextBlock } from "@/lib/text-engine/types";

export type WorkspaceDocument = {
  strokes: Stroke[];
  textBlocks: TextBlock[];
};

export const initialWorkspaceDocument: WorkspaceDocument = {
  strokes: [],
  textBlocks: []
};
