import type { CSSProperties, ReactNode } from "react";
import { useTheme } from "../theme/ThemeContext";

export type Row = {
  key: string;
  label: ReactNode;
  values: number[];
  type?: "data" | "subtotal" | "total" | "header";
  indent?: number;
  unit?: "money" | "percent" | "ratio" | "days" | "raw";
  emphasizeSign?: boolean;
};

function formatCell(value: number, unit: Row["unit"]): string {
  if (!Number.isFinite(value)) return "—";
  switch (unit) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "ratio":
      return `${value.toFixed(2)}×`;
    case "days":
      return `${Math.round(value)}d`;
    case "raw":
      return value.toFixed(1);
    case "money":
    default:
      if (Math.abs(value) >= 1000) {
        return `$${(value / 1000).toFixed(2)}B`;
      }
      return `$${value.toFixed(1)}M`;
  }
}

export function FinancialTable({
  years,
  rows,
  highlightCol,
}: {
  years: readonly string[];
  rows: Row[];
  highlightCol?: number;
}) {
  const { C } = useTheme();

  const rowStyle = (r: Row): CSSProperties => {
    switch (r.type) {
      case "header":
        return {
          background: C.light,
          fontWeight: 700,
          color: C.sub,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontSize: 10,
        };
      case "subtotal":
        return {
          fontWeight: 700,
          background: `${C.gold}08`,
          borderTop: `1px solid ${C.border}`,
        };
      case "total":
        return {
          fontWeight: 700,
          background: `${C.gold}14`,
          color: C.text,
          borderTop: `1px solid ${C.gold}55`,
          borderBottom: `1px solid ${C.gold}55`,
        };
      default:
        return {};
    }
  };

  const cellColor = (r: Row, v: number): string | undefined => {
    if (!r.emphasizeSign) return undefined;
    if (!Number.isFinite(v)) return C.sub;
    if (v > 0.05) return C.green;
    if (v < -0.05) return C.red;
    return C.sub;
  };

  return (
    <div
      style={{
        overflowX: "auto",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 11,
          color: C.text,
          minWidth: 920,
        }}
      >
        <thead>
          <tr style={{ background: C.light }}>
            <th
              style={{
                position: "sticky",
                left: 0,
                zIndex: 2,
                background: C.light,
                textAlign: "left",
                padding: "10px 12px",
                fontSize: 10,
                color: C.sub,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                minWidth: 220,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              USD M
            </th>
            {years.map((y, i) => (
              <th
                key={y}
                style={{
                  textAlign: "right",
                  padding: "10px 12px",
                  fontSize: 11,
                  color: highlightCol === i ? C.gold : C.sub,
                  fontWeight: highlightCol === i ? 700 : 600,
                  borderBottom: `1px solid ${C.border}`,
                  background: highlightCol === i ? `${C.gold}11` : "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const rs = rowStyle(r);
            const isHeader = r.type === "header";
            return (
              <tr key={r.key} style={rs}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    background: rs.background || C.card,
                    padding: "8px 12px",
                    paddingLeft: 12 + (r.indent || 0) * 16,
                    fontSize: isHeader ? 10 : 11,
                    fontWeight: rs.fontWeight || 500,
                    color: rs.color || C.text,
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.label}
                </td>
                {r.values.map((v, i) => (
                  <td
                    key={i}
                    style={{
                      textAlign: "right",
                      padding: "8px 12px",
                      fontVariantNumeric: "tabular-nums",
                      color:
                        cellColor(r, v) ||
                        (rs.color as string | undefined) ||
                        C.text,
                      fontWeight: rs.fontWeight || 500,
                      background:
                        highlightCol === i
                          ? `${C.gold}08`
                          : (rs.background as string | undefined) || "transparent",
                      borderBottom: `1px solid ${C.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isHeader ? "" : formatCell(v, r.unit)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
