import { theme } from "@/styles/theme";

export type ActiveTool = "pencil" | "eraser" | "text";

export const TOOL_SIZES: Record<Exclude<ActiveTool, "text">, number> = {
  pencil: theme.drawing.pencilSize,
  eraser: theme.drawing.eraserSize
};
