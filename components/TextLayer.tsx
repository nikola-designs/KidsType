"use client";

import { useEffect, useRef } from "react";

type TextLayerProps = {
  text: string;
  textMode: boolean;
  onTextChange: (text: string) => void;
};

export const TextLayer = ({ text, textMode, onTextChange }: TextLayerProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textMode) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
  }, [textMode]);

  return (
    <div className="absolute inset-0 z-10">
      <textarea
        autoCapitalize="sentences"
        autoCorrect="on"
        className={`absolute inset-0 w-full resize-none border-none bg-transparent px-6 pb-6 pt-24 text-[clamp(1.45rem,2vw,2rem)] font-semibold leading-[1.4] text-base-content outline-none ${
          textMode ? "pointer-events-auto caret-primary" : "pointer-events-none caret-transparent"
        }`}
        onChange={(event) => onTextChange(event.currentTarget.value)}
        readOnly={!textMode}
        ref={textareaRef}
        spellCheck={false}
        value={text}
      />
    </div>
  );
};
