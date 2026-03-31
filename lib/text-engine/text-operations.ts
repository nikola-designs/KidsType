import type { TextBlock } from "@/lib/text-engine/types";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `text-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type NewTextBlockInput = {
  x: number;
  y: number;
  text?: string;
};

export const createTextBlock = ({ x, y, text = "" }: NewTextBlockInput): TextBlock => ({
  id: createId(),
  x,
  y,
  text
});

export const updateTextBlock = (blocks: TextBlock[], id: string, text: string): TextBlock[] => {
  const index = blocks.findIndex((block) => block.id === id);
  if (index === -1 || blocks[index].text === text) {
    return blocks;
  }

  const nextBlocks = [...blocks];
  nextBlocks[index] = { ...nextBlocks[index], text };
  return nextBlocks;
};

export const removeEmptyTextBlocks = (blocks: TextBlock[]): TextBlock[] =>
  blocks.filter((block) => block.text.trim().length > 0);
