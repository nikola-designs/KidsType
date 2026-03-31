import { layoutWithLines, prepareWithSegments, type PreparedTextWithSegments } from "@chenglou/pretext";

export const textLayoutConfig = {
  fontSizePx: 34,
  lineHeightPx: 46,
  maxWidthPx: 860,
  minWidthPx: 42,
  fontFamily:
    '"Avenir Next Rounded", "Nunito", "Segoe Print", "Trebuchet MS", system-ui, sans-serif',
  fontWeight: 600
} as const;

const fontShorthand = `${textLayoutConfig.fontWeight} ${textLayoutConfig.fontSizePx}px ${textLayoutConfig.fontFamily}`;

export type TextLayout = {
  lines: string[];
  width: number;
  height: number;
  lineCount: number;
};

class PretextLayouter {
  private preparedCache = new Map<string, PreparedTextWithSegments>();

  measure(text: string, width: number = textLayoutConfig.maxWidthPx): TextLayout {
    const normalizedText = text.length ? text : " ";
    const maxWidth = Math.max(textLayoutConfig.minWidthPx, width);
    const prepared = this.getPrepared(normalizedText);
    const { lines, height, lineCount } = layoutWithLines(
      prepared,
      maxWidth,
      textLayoutConfig.lineHeightPx
    );

    const measuredWidth = lines.reduce((max, line) => Math.max(max, line.width), 0);

    return {
      lines: lines.map((line) => line.text),
      lineCount,
      height: Math.max(textLayoutConfig.lineHeightPx, Math.ceil(height)),
      width: Math.min(maxWidth, Math.max(textLayoutConfig.minWidthPx, Math.ceil(measuredWidth) + 6))
    };
  }

  private getPrepared(text: string) {
    const cached = this.preparedCache.get(text);
    if (cached) {
      return cached;
    }

    const prepared = prepareWithSegments(text, fontShorthand, { whiteSpace: "pre-wrap" });
    this.preparedCache.set(text, prepared);
    return prepared;
  }
}

const sharedLayouter = new PretextLayouter();

export const measureTextLayout = (text: string, width?: number) =>
  sharedLayouter.measure(text, width);
