import type { Point } from "@/lib/drawing-engine/types";

type PointerLikeEvent = {
  clientX: number;
  clientY: number;
  pressure: number;
};

const normalizePressure = (pressure: number) => {
  if (!Number.isFinite(pressure) || pressure <= 0) {
    return 0.5;
  }

  return pressure;
};

export const getRelativePointer = (
  event: PointerLikeEvent,
  container: HTMLElement
): Point => {
  const bounds = container.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
    pressure: normalizePressure(event.pressure)
  };
};
