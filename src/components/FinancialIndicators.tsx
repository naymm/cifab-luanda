import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTheme } from "../theme/ThemeContext";
import { SCENARIOS, type ScenarioId } from "../data/model";
import { buildIndicators, type IndicatorsYear } from "../data/indicators";

interface IndicatorDef {
  key: keyof IndicatorsYear;
  labelKey: string;
  unit: "percent" | "ratio" | "days";
  /** Higher than this = good (green); lower = warning. */
  goodThreshold?: number;
  /** Lower than this = warning (red). */
  warnThreshold?: number;
  /** Reverse means LOWER is better (e.g. Debt/Equity). */
  reverse?: boolean;
}

const GROUPS: Array<{ titleKey: string; items: IndicatorDef[] }> = [
  {
    titleKey: "indicators.groups.profitability",
    items: [
      { key: "grossMargin", labelKey: "indicators.metrics.grossMargin", unit: "percent", goodThreshold: 50, warnThreshold: 35 },
      { key: "ebitdaMargin", labelKey: "indicators.metrics.ebitdaMargin", unit: "percent", goodThreshold: 25, warnThreshold: 15 },
      { key: "ebitMargin", labelKey: "indicators.metrics.ebitMargin", unit: "percent", goodThreshold: 18, warnThreshold: 8 },
      { key: "netMargin", labelKey: "indicators.metrics.netMargin", unit: "percent", goodThreshold: 12, warnThreshold: 4 },
      { key: "roe", labelKey: "indicators.metrics.roe", unit: "percent", goodThreshold: 18, warnThreshold: 8 },
      { key: "roa", labelKey: "indicators.metrics.roa", unit: "percent", goodThreshold: 10, warnThreshold: 3 },
      { key: "roic", labelKey: "indicators.metrics.roic", unit: "percent", goodThreshold: 15, warnThreshold: 6 },
    ],
  },
  {
    titleKey: "indicators.groups.liquidity",
    items: [
      { key: "currentRatio", labelKey: "indicators.metrics.currentRatio", unit: "ratio", goodThreshold: 1.5, warnThreshold: 1.0 },
      { key: "quickRatio", labelKey: "indicators.metrics.quickRatio", unit: "ratio", goodThreshold: 1.0, warnThreshold: 0.6 },
      { key: "cashRatio", labelKey: "indicators.metrics.cashRatio", unit: "ratio", goodThreshold: 0.4, warnThreshold: 0.15 },
    ],
  },
  {
    titleKey: "indicators.groups.solvency",
    items: [
      { key: "debtEquity", labelKey: "indicators.metrics.debtEquity", unit: "ratio", goodThreshold: 0.7, warnThreshold: 1.5, reverse: true },
      { key: "debtEbitda", labelKey: "indicators.metrics.debtEbitda", unit: "ratio", goodThreshold: 2, warnThreshold: 4, reverse: true },
      { key: "interestCoverage", labelKey: "indicators.metrics.interestCoverage", unit: "ratio", goodThreshold: 4, warnThreshold: 2 },
      { key: "equityRatio", labelKey: "indicators.metrics.equityRatio", unit: "percent", goodThreshold: 50, warnThreshold: 30 },
    ],
  },
  {
    titleKey: "indicators.groups.efficiency",
    items: [
      { key: "assetTurnover", labelKey: "indicators.metrics.assetTurnover", unit: "ratio", goodThreshold: 0.9, warnThreshold: 0.4 },
      { key: "dso", labelKey: "indicators.metrics.dso", unit: "days", goodThreshold: 60, warnThreshold: 90, reverse: true },
      { key: "dio", labelKey: "indicators.metrics.dio", unit: "days", goodThreshold: 50, warnThreshold: 80, reverse: true },
      { key: "dpo", labelKey: "indicators.metrics.dpo", unit: "days", goodThreshold: 70, warnThreshold: 40 },
      { key: "ccc", labelKey: "indicators.metrics.ccc", unit: "days", goodThreshold: 45, warnThreshold: 80, reverse: true },
    ],
  },
  {
    titleKey: "indicators.groups.valuation",
    items: [
      { key: "evRevenue", labelKey: "indicators.metrics.evRevenue", unit: "ratio" },
      { key: "evEbitda", labelKey: "indicators.metrics.evEbitda", unit: "ratio" },
      { key: "pe", labelKey: "indicators.metrics.pe", unit: "ratio" },
    ],
  },
];

function fmtValue(v: number, unit: IndicatorDef["unit"]): string {
  if (!Number.isFinite(v)) return "—";
  switch (unit) {
    case "percent":
      return `${v.toFixed(1)}%`;
    case "ratio":
      return `${v.toFixed(2)}×`;
    case "days":
      return `${Math.round(v)}d`;
  }
}

function classify(
  v: number,
  def: IndicatorDef
): "good" | "warn" | "neutral" {
  if (!Number.isFinite(v) || def.goodThreshold == null) return "neutral";
  if (def.reverse) {
    if (v <= def.goodThreshold) return "good";
    if (def.warnThreshold != null && v >= def.warnThreshold) return "warn";
    return "neutral";
  }
  if (v >= def.goodThreshold) return "good";
  if (def.warnThreshold != null && v <= def.warnThreshold) return "warn";
  return "neutral";
}

export function FinancialIndicators({
  scenario,
  horizon,
}: {
  scenario: ScenarioId;
  horizon: number;
}) {
  const { C } = useTheme();
  const { t } = useTranslation();
  const { rows } = useMemo(() => buildIndicators(scenario), [scenario]);
  const hIdx = horizon - 1;
  const row = rows[hIdx];
  const s = SCENARIOS[scenario];
  const scenLabel = t(`scenarios.${scenario}.label`);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            fontFamily: "Georgia,serif",
            marginBottom: 4,
          }}
        >
          {t("indicators.title")}
        </h2>
        <div style={{ fontSize: 11, color: s.color, letterSpacing: "0.08em" }}>
          {t("common.scenarioHorizon", { label: scenLabel, n: horizon })}
        </div>
      </div>

      {GROUPS.map((g) => (
        <div key={g.titleKey} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              marginBottom: 8,
              borderBottom: `1px solid ${C.border}`,
              paddingBottom: 6,
            }}
          >
            {t(g.titleKey)}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(165px, 1fr))",
              gap: 10,
            }}
          >
            {g.items.map((def) => {
              const v = row[def.key] as number;
              const klass = classify(v, def);
              const ringColor =
                klass === "good" ? C.green : klass === "warn" ? C.red : C.sub;
              return (
                <div
                  key={def.key}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${ringColor}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: C.sub,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 4,
                    }}
                  >
                    {t(def.labelKey)}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: ringColor,
                      fontFamily: "Georgia,serif",
                    }}
                  >
                    {fmtValue(v, def.unit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 16,
          marginTop: 6,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          {t("indicators.trendsTitle")}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} />
            <YAxis
              stroke={C.sub}
              tick={{ fill: C.sub, fontSize: 10 }}
              unit="%"
              yAxisId="left"
            />
            <YAxis
              stroke={C.sub}
              tick={{ fill: C.sub, fontSize: 10 }}
              orientation="right"
              yAxisId="right"
              unit="×"
            />
            <Tooltip
              contentStyle={{
                background: C.card,
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: 11,
              }}
            />
            <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ebitdaMargin"
              stroke={C.green}
              strokeWidth={2}
              dot={false}
              name={t("indicators.metrics.ebitdaMargin")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="roe"
              stroke={C.gold}
              strokeWidth={2}
              dot={false}
              name={t("indicators.metrics.roe")}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="netMargin"
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              name={t("indicators.metrics.netMargin")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="debtEbitda"
              stroke={C.red}
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              name={t("indicators.metrics.debtEbitda")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: C.sub,
          padding: "8px 12px",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
        }}
      >
        {t("indicators.note")}
      </div>
    </div>
  );
}
