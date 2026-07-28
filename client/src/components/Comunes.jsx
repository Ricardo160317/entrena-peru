export function Campo({ label, children }) {
  return (
    <div>
      <p className="text-xs text-[#9CA39C] mb-1.5">{label}</p>
      {children}
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
        active ? "bg-[#C1272D] border-[#C1272D] text-white" : "bg-transparent border-[#3A4340] text-[#B9C0BB]"
      }`}
    >
      {children}
    </button>
  );
}

export function Anillo({ pct, color, size = 84, grosor = 9 }) {
  const r = (size - grosor) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct || 0));
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#2A312E" strokeWidth={grosor} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={grosor}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export function BarraMacro({ label, valor, meta, color }) {
  const pct = Math.min(100, (valor / meta) * 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] text-[#9CA39C] mb-0.5">
        <span>{label}</span>
        <span>
          {Math.round(valor)}/{meta}g
        </span>
      </div>
      <div className="h-1.5 bg-[#2A312E] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
