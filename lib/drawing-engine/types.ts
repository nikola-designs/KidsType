export type StrokeKind = "draw" | "erase";

export type Point = {
  x: number;
  y: number;
  pressure: number;
};

export type Stroke = {
  id: string;
  kind: StrokeKind;
  points: Point[];
  color: string;
  size: number;
};

export type CanvasSize = {
  width: number;
  height: number;
};
