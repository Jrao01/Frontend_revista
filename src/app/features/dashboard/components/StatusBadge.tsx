import { type ManuscriptStatus, STATUS_CONFIG } from "../../../data/manuscripts";

interface StatusBadgeProps {
  status: ManuscriptStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: size === "sm" ? "9px" : "10px",
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.color}30`,
        padding: size === "sm" ? "2px 7px" : "3px 10px",
        borderRadius: "12px",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
