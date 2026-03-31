import type { Stroke } from "@/lib/drawing-engine/types";

export type WorkspaceDocument = {
  strokes: Stroke[];
  textContent: string;
};

export const initialWorkspaceDocument: WorkspaceDocument = {
  strokes: [],
  textContent: ""
};
