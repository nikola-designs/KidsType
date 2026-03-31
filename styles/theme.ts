export const theme = {
  colors: {
    background: "#edf2eb",
    paper: "#f7f3e9",
    paperShade: "#f1ecdf",
    ink: "#2f3a2f",
    accent: "#7A9E7E",
    accentSoft: "#dce9dc",
    controlBackground: "#f6f8f4"
  },
  spacing: {
    toolbar: 16,
    paperRadius: 28
  },
  drawing: {
    pencilSize: 5,
    eraserSize: 28
  }
} as const;

export type Theme = typeof theme;
