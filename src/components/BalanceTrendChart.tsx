import { useId } from "react";
import type { BalancePoint } from "@/api/types";

interface BalanceTrendChartProps {
  data: BalancePoint[];
  positive: boolean;
}

export function BalanceTrendChart({ data, positive }: BalanceTrendChartProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return <div className="h-[120px]" />;
  }

  const width = 600;
  const height = 120;
  const values = data.map((d) => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.balance - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const strokeColor = positive ? "var(--color-positive)" : "var(--color-negative)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[120px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={strokeColor} />
    </svg>
  );
}
