export function Walls() {
  return (
    <g>
      {/* Outer walls */}
      <rect
        x="20" y="20" width="1160" height="800"
        fill="none" stroke="#334155" strokeWidth="6" rx="4"
      />
      {/* Entry door cutout */}
      <rect x="540" y="16" width="120" height="8" fill="#FAFAFA" />
      <line x1="540" y1="20" x2="540" y2="24" stroke="#334155" strokeWidth="2" />
      <line x1="660" y1="20" x2="660" y2="24" stroke="#334155" strokeWidth="2" />
      <text x="600" y="14" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="500">
        ENTRADA
      </text>

      {/* Left partition wall — separates cabins from open area */}
      <line x1="280" y1="20" x2="280" y2="620" stroke="#475569" strokeWidth="4" />
      {/* Door gap in left partition */}
      <line x1="280" y1="580" x2="280" y2="620" stroke="#FAFAFA" strokeWidth="8" />

      {/* Bottom partition — kitchen */}
      <line x1="700" y1="620" x2="1180" y2="620" stroke="#475569" strokeWidth="4" />
      {/* Kitchen door */}
      <line x1="700" y1="620" x2="740" y2="620" stroke="#FAFAFA" strokeWidth="8" />

      {/* Sala A divider */}
      <line x1="20" y1="420" x2="280" y2="420" stroke="#475569" strokeWidth="3" />
      {/* Sala A door */}
      <line x1="160" y1="420" x2="220" y2="420" stroke="#FAFAFA" strokeWidth="6" />

      {/* Sala B bottom */}
      <line x1="20" y1="620" x2="280" y2="620" stroke="#475569" strokeWidth="3" />

      {/* Labels */}
      <text x="600" y="660" textAnchor="middle" fontSize="12" fill="#94a3b8" letterSpacing="2">
        ZONA ABIERTA
      </text>
      <text x="940" y="720" textAnchor="middle" fontSize="11" fill="#94a3b8" letterSpacing="1">
        COCINA / ÁREA COMÚN
      </text>

      {/* Door arcs */}
      <path d="M 220 420 Q 220 390 190 390" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
      <path d="M 700 620 Q 700 590 670 590" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
      <path d="M 280 580 Q 310 580 310 610" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
    </g>
  )
}
