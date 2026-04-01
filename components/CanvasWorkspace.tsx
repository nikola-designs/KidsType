"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { TextLayer } from "@/components/TextLayer";
import { Toolbar } from "@/components/Toolbar";
import { CanvasRenderer } from "@/lib/drawing-engine/renderer";
import type { CanvasSize, Stroke } from "@/lib/drawing-engine/types";
import { getRelativePointer } from "@/lib/input-manager/pointer";
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

export const CanvasWorkspace = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("text");

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
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const surface = surfaceRef.current;
      if (!surface || activeTool === "text" || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

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
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
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
    (event: ReactPointerEvent<HTMLCanvasElement>, shouldCommit: boolean) => {
      const drawingSession = drawingSessionRef.current;

      if (!drawingSession || drawingSession.pointerId !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
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

  const handleClear = useCallback(() => {
    drawingSessionRef.current = null;
    set({ strokes: [], textContent: "" });
  }, [set]);

  const handleUndo = useCallback(() => {
    drawingSessionRef.current = null;
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    drawingSessionRef.current = null;
    redo();
  }, [redo]);

  const handleTextChange = useCallback(
    (nextText: string) => {
      set((current) => {
        if (current.textContent === nextText) {
          return current;
        }

        return {
          ...current,
          textContent: nextText
        };
      });
    },
    [set]
  );

  return (
    <section
      className={`relative h-full w-full overflow-hidden bg-base-100 text-base-content ${
        activeTool === "text"
          ? "cursor-text"
          : activeTool === "eraser"
            ? "cursor-cell"
            : "cursor-crosshair"
      }`}
      onContextMenu={(event) => event.preventDefault()}
      ref={surfaceRef}
    >
      <Toolbar
        activeTool={activeTool}
        canRedo={canRedo}
        canUndo={canUndo}
        onClear={handleClear}
        onRedo={handleRedo}
        onToolChange={setActiveTool}
        onUndo={handleUndo}
      />

      <canvas
        aria-label="Drawing surface"
        className={`absolute inset-0 z-0 h-full w-full touch-none ${
          activeTool === "text" ? "pointer-events-none" : "pointer-events-auto"
        }`}
        onPointerCancel={(event) => finishDrawing(event, false)}
        onPointerDown={startDrawing}
        onPointerMove={continueDrawing}
        onPointerUp={(event) => finishDrawing(event, true)}
        ref={canvasRef}
      />

      <TextLayer
        onTextChange={handleTextChange}
        text={present.textContent}
        textMode={activeTool === "text"}
      />
    </section>
  );
};
