import type { CanvasSize, Stroke } from "@/lib/drawing-engine/types";
import { drawSmoothStroke } from "@/lib/drawing-engine/smoothing";

type DrawSceneInput = {
  context: CanvasRenderingContext2D;
  size: CanvasSize;
  strokes: Stroke[];
  draftStroke?: Stroke | null;
};

export class CanvasRenderer {
  drawScene({ context, size, strokes, draftStroke }: DrawSceneInput) {
    context.save();
    context.clearRect(0, 0, size.width, size.height);

    for (const stroke of strokes) {
      this.drawStroke(context, stroke);
    }

    if (draftStroke) {
      this.drawStroke(context, draftStroke);
    }

    context.restore();
  }

  private drawStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
    if (!stroke.points.length) {
      return;
    }

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = stroke.size;

    if (stroke.kind === "erase") {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0, 0, 0, 1)";
      context.fillStyle = "rgba(0, 0, 0, 1)";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = stroke.color;
      context.fillStyle = stroke.color;
    }

    drawSmoothStroke(context, stroke.points);
    context.restore();
  }
}
