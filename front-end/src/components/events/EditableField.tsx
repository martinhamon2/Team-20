import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export default function EditableField({
  value,
  onChange,
  className = "",
  placeholder,
  multiline = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (multiline) handleResize();
  }, [value, multiline]);

  const baseStyles =
    "px-1 border border-transparent hover:border-blue-300 hover:bg-blue-50 focus:border-blue-500 focus:outline-none rounded transition-all w-full bg-transparent";

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleResize();
        }}
        className={`${baseStyles} resize-none overflow-hidden ${className}`}
        placeholder={placeholder}
        rows={1}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseStyles} ${className}`}
      placeholder={placeholder}
    />
  );
}
