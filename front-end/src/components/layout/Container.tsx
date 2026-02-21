interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: Props) {
  const content = <div className="mx-auto max-w-300 px-2.5">{children}</div>;

  if (className) {
    return <div className={className}>{content}</div>;
  }

  return content;
}
