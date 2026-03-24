interface WorkstationShapeProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  status: "available" | "occupied" | "soon"
  color: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const STATUS_COLORS = {
  available: { fill: "#f0fdf4", stroke: "#22c55e" },
  occupied: { fill: "#fff7ed", stroke: "#f97316" },
  soon: { fill: "#eff6ff", stroke: "#3b82f6" },
}

export function WorkstationShape({
  x, y, width, height, name, status, color, onClick, onMouseEnter, onMouseLeave,
}: WorkstationShapeProps) {
  const cfg = STATUS_COLORS[status]

  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Desk */}
      <rect
        x={x} y={y} width={width} height={height}
        rx="4" fill={cfg.fill} stroke={cfg.stroke} strokeWidth="1.5"
      />
      {/* Color top bar */}
      <rect x={x} y={y} width={width} height={4} rx="2" fill={color} />
      {/* Monitor */}
      <rect
        x={x + width * 0.2} y={y + 10}
        width={width * 0.6} height={height * 0.35}
        rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"
      />
      {/* Monitor stand */}
      <line
        x1={x + width / 2} y1={y + 10 + height * 0.35}
        x2={x + width / 2} y2={y + height * 0.65}
        stroke="#cbd5e1" strokeWidth="1.5"
      />
      {/* Chair (circle below desk) */}
      <circle
        cx={x + width / 2} cy={y + height + 10}
        r={Math.min(width, height) * 0.22}
        fill="white" stroke="#cbd5e1" strokeWidth="1.5"
      />
      {/* Name */}
      <text
        x={x + width / 2} y={y + height - 4}
        textAnchor="middle" fontSize="9" fontWeight="500"
        fill={status === "available" ? "#15803d" : status === "occupied" ? "#c2410c" : "#1d4ed8"}
      >
        {name}
      </text>
    </g>
  )
}
