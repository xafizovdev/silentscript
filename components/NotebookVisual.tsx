import type { CSSProperties } from "react";

type Props = {
  color: string;
  accent: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  rotate?: number;
  ribbon?: boolean;
  gift?: boolean;
  className?: string;
};

export default function NotebookVisual({
  color,
  accent,
  label = "silent\nscript.",
  size = "md",
  rotate = -3,
  ribbon = false,
  gift = false,
  className = "",
}: Props) {
  const style = {
    "--cover": color,
    "--accent": accent,
    "--rotate": `${rotate}deg`,
  } as CSSProperties;

  return (
    <div className={`notebook-scene notebook-scene--${size} ${gift ? "notebook-scene--gift" : ""} ${className}`} style={style} aria-hidden="true">
      {gift && <div className="gift-box" />}
      <div className="notebook-shadow" />
      <div className="notebook-object">
        <span className="notebook-pages" />
        <span className="notebook-cover-text">{label.split("\n").map((line) => <span key={line}>{line}</span>)}</span>
        <span className="notebook-elastic" />
        <span className="notebook-spine" />
        {ribbon && <span className="notebook-ribbon" />}
      </div>
    </div>
  );
}
