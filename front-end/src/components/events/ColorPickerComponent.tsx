"use client";

import type React from "react";

import type { EventSetting } from "@/types";
import { useState, useRef, useEffect } from "react";

interface ColorInputProps {
  label: string;
  settingKey: keyof EventSetting;
  initialColor: string | undefined;
  updateSettings: (partialUpdate: Partial<EventSetting>) => void;
}

export default function ColorPickerComponent({
  label,
  settingKey,
  initialColor,
  updateSettings,
}: ColorInputProps) {
  const [currentColor, setCurrentColor] = useState(initialColor || "#3B82F6");
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialColor) {
      setCurrentColor(initialColor);
    }
  }, [initialColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    updateSettings({ [settingKey]: newColor });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
  };

  const handleTextBlur = () => {
    // Validate and save hex color
    if (/^#[0-9A-F]{6}$/i.test(currentColor)) {
      updateSettings({ [settingKey]: currentColor });
    } else {
      // Reset to last valid color if invalid
      setCurrentColor(initialColor || "#3B82F6");
    }
  };

  const openColorPicker = () => {
    colorInputRef.current?.click();
  };

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={currentColor}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="#000000"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <div
          className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-lg border-2 border-gray-300 shadow-sm transition-all hover:scale-105 hover:border-gray-400"
          style={{ backgroundColor: currentColor }}
          onClick={openColorPicker}
          title="Klik om kleurkiezer te openen"
        />
        <input
          ref={colorInputRef}
          type="color"
          value={currentColor}
          onChange={handleColorChange}
          className="h-0 w-0 opacity-0"
        />
      </div>
    </div>
  );
}
