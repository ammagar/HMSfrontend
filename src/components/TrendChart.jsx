export default function TrendChart({ data }) {
  if (!data || !data.length) return null;

  const width = 560;
  const height = 180;
  const padding = { top: 12, right: 12, bottom: 28, left: 12 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxAppt = Math.max(1, ...data.map((d) => d.appointments));
  const maxCollection = Math.max(1, ...data.map((d) => d.collection));

  const barGroupWidth = chartW / data.length;
  const barWidth = Math.min(18, barGroupWidth * 0.28);

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Appointments and collections, last 7 days">
        {/* baseline */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--line)"
          strokeWidth="1"
        />
        {data.map((d, i) => {
          const groupX = padding.left + i * barGroupWidth + barGroupWidth / 2;
          const apptH = (d.appointments / maxAppt) * chartH;
          const collH = (d.collection / maxCollection) * chartH;
          return (
            <g key={d.date}>
              <rect
                x={groupX - barWidth - 2}
                y={height - padding.bottom - apptH}
                width={barWidth}
                height={apptH}
                rx="3"
                fill="var(--teal-700)"
                opacity="0.9"
              />
              <rect
                x={groupX + 2}
                y={height - padding.bottom - collH}
                width={barWidth}
                height={collH}
                rx="3"
                fill="var(--coral-500)"
                opacity="0.9"
              />
              <text x={groupX} y={height - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-body)">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="trend-legend">
        <span>
          <i style={{ background: "var(--teal-700)" }} /> Appointments
        </span>
        <span>
          <i style={{ background: "var(--coral-500)" }} /> Collection (₹)
        </span>
      </div>
    </div>
  );
}
