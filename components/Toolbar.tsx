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

const baseButtonClasses =
  "h-11 min-w-20 rounded-2xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/70";

export const Toolbar = ({
  activeTool,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
  onClear
}: ToolbarProps) => (
  <div className="toolbar-shell absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-3xl border border-sage/20 p-2 shadow-sm">
    {toolButtons.map((tool) => (
      <button
        aria-pressed={activeTool === tool.id}
        className={`${baseButtonClasses} ${
          activeTool === tool.id
            ? "bg-sage text-white shadow-sm"
            : "bg-white/90 text-ink hover:bg-white"
        }`}
        key={tool.id}
        onClick={() => onToolChange(tool.id)}
        type="button"
      >
        {tool.label}
      </button>
    ))}
    <div className="mx-1 h-8 w-px bg-sage/15" />
    <button
      className={`${baseButtonClasses} bg-white/90 text-ink hover:bg-white disabled:cursor-not-allowed disabled:opacity-35`}
      disabled={!canUndo}
      onClick={onUndo}
      type="button"
    >
      Undo
    </button>
    <button
      className={`${baseButtonClasses} bg-white/90 text-ink hover:bg-white disabled:cursor-not-allowed disabled:opacity-35`}
      disabled={!canRedo}
      onClick={onRedo}
      type="button"
    >
      Redo
    </button>
    <button
      className={`${baseButtonClasses} bg-rose-50 text-rose-900 hover:bg-rose-100`}
      onClick={onClear}
      type="button"
    >
      Clear
    </button>
  </div>
);
