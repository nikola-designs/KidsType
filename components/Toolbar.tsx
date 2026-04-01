"use client";

import type { ActiveTool } from "@/lib/state/tool-state";

type ToolbarProps = {
  activeTool: ActiveTool;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: ActiveTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
};

type ToolButtonConfig = {
  id: ActiveTool;
  label: string;
};

const toolButtons: ToolButtonConfig[] = [
  { id: "pencil", label: "Pencil" },
  { id: "eraser", label: "Eraser" },
  { id: "text", label: "Type" }
];

export const Toolbar = ({
  activeTool,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
  onClear
}: ToolbarProps) => (
  <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-box border border-base-300/80 bg-base-200/90 p-2 shadow-lg backdrop-blur">
    {toolButtons.map((tool) => (
      <button
        aria-pressed={activeTool === tool.id}
        className={`btn h-11 min-h-11 min-w-20 rounded-box px-4 text-sm font-semibold ${
          activeTool === tool.id ? "btn-primary" : "btn-ghost bg-base-100/70"
        }`}
        key={tool.id}
        onClick={() => onToolChange(tool.id)}
        type="button"
      >
        {tool.label}
      </button>
    ))}
    <div className="mx-1 h-8 w-px bg-base-content/20" />
    <button
      className="btn btn-ghost h-11 min-h-11 min-w-20 rounded-box bg-base-100/70 px-4 text-sm font-semibold disabled:opacity-35"
      disabled={!canUndo}
      onClick={onUndo}
      type="button"
    >
      Undo
    </button>
    <button
      className="btn btn-ghost h-11 min-h-11 min-w-20 rounded-box bg-base-100/70 px-4 text-sm font-semibold disabled:opacity-35"
      disabled={!canRedo}
      onClick={onRedo}
      type="button"
    >
      Redo
    </button>
    <button
      className="btn btn-outline btn-secondary h-11 min-h-11 min-w-20 rounded-box px-4 text-sm font-semibold"
      onClick={onClear}
      type="button"
    >
      Clear
    </button>
  </div>
);
