interface CabinShapeProps {
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
  available: { fill: "#f0fdf4", stroke: "#22c55e", text: "#15803d" },
  occupied: { fill: "#fff7ed", stroke: "#f97316", text: "#c2410c" },
  soon: { fill: "#eff6ff", stroke: "#3b82f6", text: "#1d4ed8" },
}

export function CabinShape({
  x, y, width, height, name, status, color, onClick, onMouseEnter, onMouseLeave,
}: CabinShapeProps) {
  const cfg = STATUS_COLORS[status]

  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      {/* Cabin box */}
      <rect
        x={x} y={y} width={width} height={height}
        rx="5" fill={cfg.fill} stroke={cfg.stroke} strokeWidth="1.5"
      />
      {/* Color left bar */}
      <rect x={x} y={y + 4} width={4} height={height - 8} rx="2" fill={color} />
      {/* Small desk */}
      <rect
        x={x + 10} y={y + 12}
        width={width - 20} height={height * 0.4}
        rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"
      />
      {/* Phone icon */}
      <text x={x + width / 2} y={y + height * 0.45} textAnchor="middle" fontSize="12">
        📞
      </text>
      {/* Name */}
      <text
        x={x + width / 2} y={y + height - 6}
        textAnchor="middle" fontSize="9" fontWeight="500"
        fill={cfg.text}
      >
        {name}
      </text>
    </g>
  )
}
