"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { flushSync } from "react-dom";
import { PaperSurface } from "@/components/PaperSurface";
import { TextLayer } from "@/components/TextLayer";
import { Toolbar } from "@/components/Toolbar";
import { CanvasRenderer } from "@/lib/drawing-engine/renderer";
import type { CanvasSize, Stroke } from "@/lib/drawing-engine/types";
import { getRelativePointer } from "@/lib/input-manager/pointer";
import {
  createTextBlock,
  removeEmptyTextBlocks,
  updateTextBlock
} from "@/lib/text-engine/text-operations";
import { useHistoryState } from "@/lib/state/history";
import type { ActiveTool } from "@/lib/state/tool-state";
import { TOOL_SIZES } from "@/lib/state/tool-state";
import {
  initialWorkspaceDocument,
  type WorkspaceDocument
} from "@/lib/state/workspace-state";
import { theme } from "@/styles/theme";

type DrawingSession = {
  pointerId: number;
  stroke: Stroke;
};

const createStrokeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `stroke-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const pointsAreClose = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y) < 0.35;

const focusEditableBlock = (container: HTMLElement, blockId: string) => {
  const focusElement = () => {
    const editable = container.querySelector(
      `[data-text-block-id="${blockId}"]`
    ) as HTMLElement | null;
    if (!editable) {
      return false;
    }

    editable.focus();

    const selection = window.getSelection();
    if (!selection) {
      return true;
    }

    const range = document.createRange();
    range.selectNodeContents(editable);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  if (focusElement()) {
    return;
  }

  requestAnimationFrame(() => {
    focusElement();
  });
};

export const CanvasWorkspace = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("pencil");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const { present, set, undo, redo, canUndo, canRedo } =
    useHistoryState<WorkspaceDocument>(initialWorkspaceDocument);

  const documentRef = useRef(present);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingSessionRef = useRef<DrawingSession | null>(null);
  const rendererRef = useRef(new CanvasRenderer());
  const canvasSizeRef = useRef<CanvasSize>({ width: 1, height: 1 });

  const renderCanvas = useCallback((draftStroke?: Stroke | null) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    rendererRef.current.drawScene({
      context,
      size: canvasSizeRef.current,
      strokes: documentRef.current.strokes,
      draftStroke
    });
  }, []);

  useEffect(() => {
    documentRef.current = present;
    renderCanvas(drawingSessionRef.current?.stroke ?? null);
  }, [present, renderCanvas]);

  useEffect(() => {
    const surface = surfaceRef.current;
    const canvas = canvasRef.current;
    if (!surface || !canvas) {
      return;
    }

    const resizeCanvas = () => {
      const bounds = surface.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(bounds.width * dpr);
      canvas.height = Math.floor(bounds.height * dpr);
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvasSizeRef.current = { width: bounds.width, height: bounds.height };
      renderCanvas(drawingSessionRef.current?.stroke ?? null);
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(surface);

    return () => observer.disconnect();
  }, [renderCanvas]);

  const startDrawing = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const surface = surfaceRef.current;
      if (!surface || activeTool === "text") {
        return;
      }
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      surface.setPointerCapture(event.pointerId);
      setActiveBlockId(null);

      const point = getRelativePointer(event, surface);
      const nextStroke: Stroke = {
        id: createStrokeId(),
        kind: activeTool === "eraser" ? "erase" : "draw",
        color: theme.colors.ink,
        size: activeTool === "eraser" ? TOOL_SIZES.eraser : TOOL_SIZES.pencil,
        points: [point]
      };

      drawingSessionRef.current = {
        pointerId: event.pointerId,
        stroke: nextStroke
      };

      renderCanvas(nextStroke);
    },
    [activeTool, renderCanvas]
  );

  const continueDrawing = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drawingSession = drawingSessionRef.current;
      const surface = surfaceRef.current;

      if (!drawingSession || !surface || drawingSession.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const nextPoint = getRelativePointer(event, surface);
      const points = drawingSession.stroke.points;
      const previousPoint = points[points.length - 1];

      if (previousPoint && pointsAreClose(previousPoint, nextPoint)) {
        return;
      }

      points.push(nextPoint);
      renderCanvas(drawingSession.stroke);
    },
    [renderCanvas]
  );

  const finishDrawing = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, shouldCommit: boolean) => {
      const surface = surfaceRef.current;
      const drawingSession = drawingSessionRef.current;

      if (!drawingSession || drawingSession.pointerId !== event.pointerId) {
        return;
      }

      if (surface && surface.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }

      drawingSessionRef.current = null;

      if (!shouldCommit) {
        renderCanvas(null);
        return;
      }

      const completedStroke = drawingSession.stroke;
      set((current) => ({
        ...current,
        strokes: [...current.strokes, completedStroke]
      }));
    },
    [renderCanvas, set]
  );

  const beginTextBlock = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (activeTool !== "text") {
        return;
      }
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.dataset.textBlock === "true") {
        return;
      }

      const surface = surfaceRef.current;
      if (!surface) {
        return;
      }

      const point = getRelativePointer(event, surface);
      const nextBlock = createTextBlock({
        x: Math.max(10, point.x - 2),
        y: Math.max(10, point.y - 16)
      });

      flushSync(() => {
        set((current) => ({
          ...current,
          textBlocks: [...current.textBlocks, nextBlock]
        }));
        setActiveBlockId(nextBlock.id);
      });

      focusEditableBlock(surface, nextBlock.id);
    },
    [activeTool, set]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (activeTool === "text") {
        beginTextBlock(event);
        return;
      }

      startDrawing(event);
    },
    [activeTool, beginTextBlock, startDrawing]
  );

  const handleUpdateBlock = useCallback(
    (id: string, text: string) => {
      set((current) => {
        const nextBlocks = updateTextBlock(current.textBlocks, id, text);
        if (nextBlocks === current.textBlocks) {
          return current;
        }

        return {
          ...current,
          textBlocks: nextBlocks
        };
      });
    },
    [set]
  );

  const handleBlurBlock = useCallback(
    (id: string) => {
      set((current) => {
        const nextBlocks = removeEmptyTextBlocks(current.textBlocks);
        if (nextBlocks.length === current.textBlocks.length) {
          return current;
        }

        return {
          ...current,
          textBlocks: nextBlocks
        };
      });

      setActiveBlockId((current) => (current === id ? null : current));
    },
    [set]
  );

  const handleClear = useCallback(() => {
    set({ strokes: [], textBlocks: [] });
    setActiveBlockId(null);
  }, [set]);

  return (
    <section className="mx-auto flex h-full w-full max-w-[1300px] flex-col">
      <div className="relative flex h-full flex-col">
        <Toolbar
          activeTool={activeTool}
          canRedo={canRedo}
          canUndo={canUndo}
          onClear={handleClear}
          onRedo={() => {
            redo();
            setActiveBlockId(null);
          }}
          onToolChange={setActiveTool}
          onUndo={() => {
            undo();
            setActiveBlockId(null);
          }}
        />

        <div
          className={`h-full pt-16 ${
            activeTool === "text"
              ? "cursor-text"
              : activeTool === "eraser"
                ? "cursor-cell"
                : "cursor-crosshair"
          }`}
        >
          <PaperSurface
            canvasRef={canvasRef}
            onPointerCancel={(event) => finishDrawing(event, false)}
            onPointerDown={handlePointerDown}
            onPointerMove={continueDrawing}
            onPointerUp={(event) => finishDrawing(event, true)}
            surfaceRef={surfaceRef}
          >
            <TextLayer
              activeBlockId={activeBlockId}
              blocks={present.textBlocks}
              onBlurBlock={handleBlurBlock}
              onFocusBlock={setActiveBlockId}
              onUpdateBlock={handleUpdateBlock}
              textMode={activeTool === "text"}
            />
          </PaperSurface>
        </div>
      </div>
    </section>
  );
};
