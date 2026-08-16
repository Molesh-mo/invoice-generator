interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const gap = barWidth * 0.3;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height / 2.5}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * (height / 2.5 - 8);
          const x = i * barWidth + gap / 2;
          const y = height / 2.5 - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth - gap}
                height={barH}
                rx="0.5"
                fill="#6b5d8a"
                opacity={0.85}
              />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {data.map((d, i) => (
          <div key={i} className="text-center" style={{ width: `${barWidth}%` }}>
            <p className="text-[10px] text-slate-500 font-medium truncate">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={14} />
          {total > 0 && data.map((d, i) => {
            const dash = (d.value / total) * circumference;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={14}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-slate-600 font-medium">{d.label}</span>
            <span className="text-sm text-slate-400 ml-auto pl-3">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
