import { useId } from "react";
import type { BalancePoint } from "@/api/types";

interface BalanceTrendChartProps {
  data: BalancePoint[];
  positive: boolean;
}

/** Área + linha do card de saldo, com as mesmas medidas do mockup:
 *  viewBox 620x150, gradiente 30% → 0, traço 2.2 e ponto no último valor. */
export function BalanceTrendChart({ data, positive }: BalanceTrendChartProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return <div className="h-[150px]" />;
  }

  const width = 620;
  const height = 150;
  const values = data.map((d) => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 26 - ((d.balance - min) / range) * (height - 52);
    return { x, y };
  });

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `M${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} L${width} ${height} L0 ${height} Z`;
  const stroke = positive ? "var(--color-brand)" : "var(--color-negative)";
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block h-[150px] w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4" fill="var(--color-background)" stroke={stroke} strokeWidth="2.4" />
    </svg>
  );
}
