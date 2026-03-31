"use client";

import type { PointerEventHandler, ReactNode, RefObject } from "react";

type PaperSurfaceProps = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  children: ReactNode;
};

export const PaperSurface = ({
  surfaceRef,
  canvasRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  children
}: PaperSurfaceProps) => (
  <section
    className="paper-surface relative h-full w-full overflow-hidden rounded-[28px]"
    onContextMenu={(event) => event.preventDefault()}
    onPointerCancel={onPointerCancel}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    ref={surfaceRef}
  >
    <canvas
      aria-label="Drawing surface"
      className="paper-canvas absolute inset-0 z-0 h-full w-full"
      ref={canvasRef}
    />
    {children}
  </section>
);
