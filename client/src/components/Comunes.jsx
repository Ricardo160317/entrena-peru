export function Campo({ label, children }) {
  return (
    <div>
      <p className="text-xs text-[var(--muted)] mb-1.5">{label}</p>
      {children}
    </div>
  );
}

// Estado vacío consistente para toda la app: ícono en un círculo con tinte del acento,
// mensaje corto y, si aplica, una acción directa (en vez de una caja de texto gris muerta).
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl px-6 py-9">
      {Icon && (
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "var(--accent-15)" }}>
          <Icon size={20} color="var(--accent)" />
        </div>
      )}
      {title && <p className="text-sm font-semibold">{title}</p>}
      <p className="text-xs text-[var(--muted)] max-w-[260px]">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-xs font-semibold text-[var(--btn-text)] bg-[var(--btn)] hover:bg-[var(--btn-hover)] rounded-full px-4 py-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
        active ? "bg-[var(--btn)] hover:bg-[var(--btn-hover)] border-[var(--accent)] text-[var(--bg)]" : "bg-transparent border-[var(--border)] text-[var(--muted)]"
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
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={grosor} fill="none" />
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
      <div className="flex justify-between text-[10px] text-[var(--muted)] mb-0.5">
        <span>{label}</span>
        <span>
          {Math.round(valor)}/{meta}g
        </span>
      </div>
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
