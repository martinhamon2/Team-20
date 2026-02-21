// Handle CSS imports with path aliases
declare module "@/styles/*.css" {
  const content: { [className: string]: string };
  export default content;
}
