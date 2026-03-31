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
    if (!activeBlockId) {
      return;
    }

    const activeElement = blockRefs.current.get(activeBlockId);
    if (!activeElement) {
      return;
    }

    activeElement.focus();
    placeCaretAtEnd(activeElement);
  }, [activeBlockId, blocks.length]);

  return (
    <div className={`absolute inset-0 z-10 ${textMode ? "pointer-events-auto" : "pointer-events-none"}`}>
      {blocks.map((block) => {
        const layout = blockLayouts.get(block.id);
        if (!layout) {
          return null;
        }

        const isActive = textMode && activeBlockId === block.id;
        const sharedStyle = {
          left: block.x,
          top: block.y,
          width: `${layout.width}px`,
          minHeight: `${layout.height}px`,
          lineHeight: `${textLayoutConfig.lineHeightPx}px`,
          fontSize: `${textLayoutConfig.fontSizePx}px`,
          fontWeight: textLayoutConfig.fontWeight
        };

        return (
          <div
            className="absolute rounded-md px-1 text-ink"
            data-text-block="true"
            key={block.id}
            onPointerDown={(event) => {
              if (!textMode) {
                return;
              }
              event.stopPropagation();
              onFocusBlock(block.id);
            }}
            style={sharedStyle}
          >
            {isActive ? (
              <div
                className="whitespace-pre-wrap break-words caret-sage outline-none"
                contentEditable
                data-text-block="true"
                onBlur={() => onBlurBlock(block.id)}
                onInput={(event) => onUpdateBlock(block.id, event.currentTarget.textContent ?? "")}
                ref={(node) => {
                  if (node) {
                    blockRefs.current.set(block.id, node);
                    return;
                  }
                  blockRefs.current.delete(block.id);
                }}
                suppressContentEditableWarning
              >
                {block.text}
              </div>
            ) : (
              <div className="pointer-events-none whitespace-pre-wrap break-words">
                {layout.lines.map((line, index) => (
                  <div className="min-h-[1em]" key={`${block.id}-line-${index}`}>
                    {line.length ? line : "\u00A0"}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
