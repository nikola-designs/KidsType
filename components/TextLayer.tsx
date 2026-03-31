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

const placeCaretAtEnd = (element: HTMLElement | HTMLTextAreaElement) => {
  if (element instanceof HTMLTextAreaElement) {
    const end = element.value.length;
    element.setSelectionRange(end, end);
    return;
  }

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
  const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());
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

    const activeElement = inputRefs.current.get(activeBlockId);
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

        if (isActive) {
          return (
            <textarea
              autoFocus
              className="absolute resize-none overflow-hidden rounded-md border-none bg-transparent px-1 text-ink caret-sage outline-none"
              data-text-block="true"
              data-text-input-id={block.id}
              key={block.id}
              onBlur={() => onBlurBlock(block.id)}
              onChange={(event) => onUpdateBlock(block.id, event.currentTarget.value)}
              onPointerDown={(event) => {
                event.stopPropagation();
                onFocusBlock(block.id);
              }}
              ref={(node) => {
                if (node) {
                  inputRefs.current.set(block.id, node);
                  return;
                }
                inputRefs.current.delete(block.id);
              }}
              rows={1}
              spellCheck={false}
              style={{
                ...sharedStyle,
                height: `${layout.height}px`
              }}
              value={block.text}
            />
          );
        }

        return (
          <div
            className="absolute whitespace-pre-wrap break-words rounded-md px-1 text-ink"
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
            {layout.lines.map((line, index) => (
              <div className="min-h-[1em]" key={`${block.id}-line-${index}`}>
                {line.length ? line : "\u00A0"}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
