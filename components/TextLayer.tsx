"use client";

import { useEffect, useMemo, useRef } from "react";
import type { TextBlock } from "@/lib/text-engine/types";
import { measureTextLayout, textLayoutConfig } from "@/lib/text-engine/pretext-layout";

type TextLayerProps = {
  blocks: TextBlock[];
  activeBlockId: string | null;
  textMode: boolean;
  onFocusBlock: (id: string) => void;
  onUpdateBlock: (id: string, text: string) => void;
  onBlurBlock: (id: string) => void;
};

const placeCaretAtEnd = (element: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

export const TextLayer = ({
  blocks,
  activeBlockId,
  textMode,
  onFocusBlock,
  onUpdateBlock,
  onBlurBlock
}: TextLayerProps) => {
  const blockRefs = useRef(new Map<string, HTMLDivElement>());
  const blockLayouts = useMemo(
    () =>
      new Map(
        blocks.map((block) => [
          block.id,
          measureTextLayout(block.text, textLayoutConfig.maxWidthPx)
        ])
      ),
    [blocks]
  );

  useEffect(() => {
    if (!activeBlockId || !textMode) {
      return;
    }

    const activeElement = blockRefs.current.get(activeBlockId);
    if (!activeElement) {
      return;
    }

    activeElement.focus();
    placeCaretAtEnd(activeElement);
  }, [activeBlockId, blocks.length, textMode]);

  return (
    <div className={`absolute inset-0 z-10 ${textMode ? "pointer-events-auto" : "pointer-events-none"}`}>
      {blocks.map((block) => {
        const layout = blockLayouts.get(block.id);
        if (!layout) {
          return null;
        }

        return (
          <div
            className="absolute whitespace-pre-wrap break-words rounded-md px-1 text-ink caret-sage outline-none"
            contentEditable={textMode}
            data-text-block="true"
            data-text-block-id={block.id}
            key={block.id}
            onBlur={() => onBlurBlock(block.id)}
            onInput={(event) => onUpdateBlock(block.id, event.currentTarget.textContent ?? "")}
            onPointerDown={(event) => {
              if (!textMode) {
                return;
              }
              event.stopPropagation();
              event.currentTarget.focus();
              onFocusBlock(block.id);
            }}
            ref={(node) => {
              if (node) {
                blockRefs.current.set(block.id, node);
                return;
              }
              blockRefs.current.delete(block.id);
            }}
            spellCheck={false}
            style={{
              left: block.x,
              top: block.y,
              width: `${layout.width}px`,
              minHeight: `${layout.height}px`,
              lineHeight: `${textLayoutConfig.lineHeightPx}px`,
              fontSize: `${textLayoutConfig.fontSizePx}px`,
              fontWeight: textLayoutConfig.fontWeight
            }}
            suppressContentEditableWarning
          >
            {block.text}
          </div>
        );
      })}
    </div>
  );
};
