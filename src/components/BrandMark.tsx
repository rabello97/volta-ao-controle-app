interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M32 12.5 A19.5 19.5 0 1 1 12.5 32" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M12.5 18 L19 30.5 L6 30.5 Z" fill="currentColor" />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </svg>
  );
}
