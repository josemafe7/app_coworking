interface RoomShapeProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  capacity: number
  status: "available" | "occupied" | "soon"
  color: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const STATUS_COLORS = {
  available: { fill: "#f0fdf4", stroke: "#22c55e", text: "#15803d" },
  occupied: { fill: "#fff7ed", stroke: "#f97316", text: "#c2410c" },
  soon: { fill: "#eff6ff", stroke: "#3b82f6", text: "#1d4ed8" },
}

export function RoomShape({
  x, y, width, height, name, capacity, status, color, onClick, onMouseEnter, onMouseLeave,
}: RoomShapeProps) {
  const cfg = STATUS_COLORS[status]
  const tableW = width * 0.55
  const tableH = height * 0.35
  const tableX = x + (width - tableW) / 2
  const tableY = y + (height - tableH) / 2

  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Room background */}
      <rect
        x={x} y={y} width={width} height={height}
        rx="6" fill={cfg.fill}
        stroke={cfg.stroke} strokeWidth="2"
      />
      {/* Color indicator */}
      <rect x={x} y={y} width={6} height={height} rx="3" fill={color} />

      {/* Conference table */}
      <rect
        x={tableX} y={tableY} width={tableW} height={tableH}
        rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5"
      />

      {/* Chairs around table */}
      {Array.from({ length: Math.min(capacity, 8) }).map((_, i) => {
        const positions = [
          { cx: tableX + tableW * 0.25, cy: tableY - 8 },
          { cx: tableX + tableW * 0.5, cy: tableY - 8 },
          { cx: tableX + tableW * 0.75, cy: tableY - 8 },
          { cx: tableX + tableW + 8, cy: tableY + tableH * 0.35 },
          { cx: tableX + tableW + 8, cy: tableY + tableH * 0.65 },
          { cx: tableX + tableW * 0.75, cy: tableY + tableH + 8 },
          { cx: tableX + tableW * 0.5, cy: tableY + tableH + 8 },
          { cx: tableX + tableW * 0.25, cy: tableY + tableH + 8 },
        ]
        const pos = positions[i]
        return (
          <circle key={i} cx={pos.cx} cy={pos.cy} r="5"
            fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
        )
      })}

      {/* Name */}
      <text
        x={x + width / 2} y={y + height - 12}
        textAnchor="middle" fontSize="11" fontWeight="600"
        fill={cfg.text}
      >
        {name}
      </text>
      <text
        x={x + width / 2} y={y + height - 1}
        textAnchor="middle" fontSize="9" fill="#94a3b8"
      >
        {capacity} pers.
      </text>
    </g>
  )
}
