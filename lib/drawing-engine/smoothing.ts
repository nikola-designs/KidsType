import type { Point } from "@/lib/drawing-engine/types";

const midpoint = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2
});

export const drawSmoothStroke = (context: CanvasRenderingContext2D, points: Point[]) => {
  if (!points.length) {
    return;
  }

  if (points.length === 1) {
    const point = points[0];
    context.beginPath();
    context.arc(point.x, point.y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i += 1) {
    const control = points[i];
    const nextMidpoint = midpoint(control, points[i + 1]);
    context.quadraticCurveTo(control.x, control.y, nextMidpoint.x, nextMidpoint.y);
  }

  const lastPoint = points[points.length - 1];
  context.lineTo(lastPoint.x, lastPoint.y);
  context.stroke();
};
