import type { ReactNode } from "react";

export type IconProps = { size?: number; strokeWidth?: number; className?: string };

function Icon({ children, size = 20, strokeWidth = 1.7, className }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return <Icon {...props}><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></Icon>;
}
export function MenuIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16"/></Icon>;
}
export function CloseIcon(props: IconProps) {
  return <Icon {...props}><path d="m6 6 12 12M18 6 6 18"/></Icon>;
}
export function ArrowIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14M14 7l5 5-5 5"/></Icon>;
}
export function LeafIcon(props: IconProps) {
  return <Icon {...props}><path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z"/><path d="M4 20c4-5 8-8 13-11"/></Icon>;
}
export function HandIcon(props: IconProps) {
  return <Icon {...props}><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v6c0 4-3 7-7 7h-1c-3 0-5-1-7-4l-2-3a1.7 1.7 0 0 1 3-2l2 2"/></Icon>;
}
export function GiftIcon(props: IconProps) {
  return <Icon {...props}><path d="M4 10h16v10H4zM2 7h20v3H2zM12 7v13"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Zm0 0h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z"/></Icon>;
}
export function ShieldIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></Icon>;
}
export function TelegramIcon(props: IconProps) {
  return <Icon {...props}><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></Icon>;
}
export function MinusIcon(props: IconProps) {
  return <Icon {...props}><path d="M5 12h14"/></Icon>;
}
export function PlusIcon(props: IconProps) {
  return <Icon {...props}><path d="M12 5v14M5 12h14"/></Icon>;
}
