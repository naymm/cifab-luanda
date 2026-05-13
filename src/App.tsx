import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useTheme } from "./theme/ThemeContext";
import { LanguageSelector } from "./components/LanguageSelector";
import { ThemeToggle } from "./components/ThemeToggle";
import { FinancialStatements } from "./components/FinancialStatements";
import { FinancialIndicators } from "./components/FinancialIndicators";
import logoDark from "./logo-dark.png";
import logoLight from "./logo-light.png";
import {
  YEARS,
  SCENARIOS,
  SCENARIO_IDS,
  REVENUE,
  EBITDA,
  EBITDA_PCT,
  FCF,
  EV,
  PRE_MONEY_DCF,
  CAPEX_UNITS,
  UNIT_REV_BASE,
  OPEX_ITEMS,
  fmt,
  calcDCF,
  type ScenarioId,
} from "./data/model";

// ─── MINI COMPONENTS ───────────────────────────────────────────────────────
const Tab = ({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: (id: string) => void;
  children: React.ReactNode;
}) => {
  const { C } = useTheme();
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        background: active ? C.gold : "transparent",
        color: active ? C.bg : C.sub,
        border: `1px solid ${active ? C.gold : C.border}`,
        borderRadius: 5,
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
};

const ScenBtn = ({
  id,
  active,
  onClick,
}: {
  id: ScenarioId;
  active: boolean;
  onClick: (id: ScenarioId) => void;
}) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const s = SCENARIOS[id];
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        background: active ? s.color + "22" : "transparent",
        color: active ? s.color : C.sub,
        border: `2px solid ${active ? s.color : C.border}`,
        borderRadius: 6,
        padding: "6px 16px",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {s.emoji} {t(`scenarios.${id}.label`)}
    </button>
  );
};

const HorBtn = ({
  h,
  active,
  onClick,
}: {
  h: number;
  active: boolean;
  onClick: (h: number) => void;
}) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      onClick={() => onClick(h)}
      style={{
        background: active ? C.blue + "22" : "transparent",
        color: active ? C.blue : C.sub,
        border: `1px solid ${active ? C.blue : C.border}`,
        borderRadius: 5,
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {t("header.yearsShort", { n: h })}
    </button>
  );
};

const KPI = ({
  label,
  value,
  sub,
  color,
  big,
}: {
  label: any;
  value: any;
  sub?: any;
  color?: any;
  big?: any;
}) => {
  const { C } = useTheme();
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "14px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: C.sub,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: big ? 28 : 22,
          fontWeight: 700,
          color: color || C.gold,
          fontFamily: "Georgia,serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: C.sub, marginTop: 5 }}>{sub}</div>}
    </div>
  );
};

function useChartTooltipStyle() {
  const { C } = useTheme();
  return {
    background: C.card,
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: 11,
  };
}

const CT = ({ contentStyle, ...rest }: any) => {
  const baseStyle = useChartTooltipStyle();
  return <Tooltip contentStyle={{ ...baseStyle, ...contentStyle }} {...rest} />;
};

// ─── SCREENS ───────────────────────────────────────────────────────────────
const Overview = ({ scenario, horizon }: { scenario: ScenarioId; horizon: number }) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const s = SCENARIOS[scenario];
  const scenLabel = t(`scenarios.${scenario}.label`);
  const hIdx = horizon - 1;
  const revH = REVENUE[scenario][hIdx];
  const ebitH = EBITDA[scenario][hIdx];
  const pmDCF = PRE_MONEY_DCF[scenario][horizon];
  const evH = EV[scenario][hIdx];

  const chartData = YEARS.slice(0, horizon).map((y, i) => ({
    year: y,
    revenue: REVENUE[scenario][i],
    ebitda: EBITDA[scenario][i],
    evMult: EV[scenario][i],
  }));

  const irrText =
    scenario === "conservative" ? "19%" : scenario === "base" ? "22%" : "27%";
  const paybackRange =
    scenario === "conservative" ? "7–8" : scenario === "base" ? "5–6" : "3–4";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: s.color,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 3,
            }}
          >
            {t("common.scenarioHorizon", { label: scenLabel, n: horizon })}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              fontFamily: "Georgia,serif",
            }}
          >
            {t("overview.title")}
          </h2>
        </div>
        <div
          style={{
            background: s.color + "22",
            border: `1px solid ${s.color}55`,
            borderRadius: 8,
            padding: "10px 18px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 10, color: C.sub }}>{t("overview.preMoneyDcf")}</div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: s.color,
              fontFamily: "Georgia,serif",
            }}
          >
            {fmt(pmDCF)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <KPI
          label={t("overview.kpiRevenue", { n: horizon })}
          value={fmt(revH)}
          sub={t("overview.kpiRevenueSub")}
          color={s.color}
        />
        <KPI
          label={t("overview.kpiEbitda", { n: horizon })}
          value={fmt(ebitH)}
          sub={t("common.margin", { n: EBITDA_PCT[scenario][hIdx] })}
          color={C.green}
        />
        <KPI
          label={t("overview.kpiEv")}
          value={fmt(evH)}
          sub={t("overview.kpiEvSub", { mult: s.exitMult })}
        />
        <KPI
          label={t("overview.kpiIrr")}
          value={irrText}
          sub={t("overview.kpiIrrSub")}
          color={C.green}
        />
        <KPI
          label={t("overview.kpiPayback")}
          value={t("overview.paybackValue", { range: paybackRange })}
          sub={t("overview.kpiPaybackSub")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {t("overview.chartTitle", { n: horizon, label: scenLabel })}
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 11 }} />
              <YAxis yAxisId="rev" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
              <YAxis
                yAxisId="ev"
                orientation="right"
                stroke={C.sub}
                tick={{ fill: C.sub, fontSize: 10 }}
                unit="M"
              />
              <CT />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
              <Area
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                fill="url(#gRev)"
                stroke={s.color}
                strokeWidth={2}
                name={t("overview.chartRevenue")}
              />
              <Bar
                yAxisId="rev"
                dataKey="ebitda"
                fill={C.green + "88"}
                name={t("overview.chartEbitda")}
                barSize={18}
              />
              <Line
                yAxisId="ev"
                type="monotone"
                dataKey="evMult"
                stroke={C.gold}
                strokeWidth={2}
                dot={false}
                name={t("overview.chartEv")}
                strokeDasharray="5 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 16,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.sub,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              {t("overview.compareTitle", { n: horizon })}
            </div>
            {(Object.keys(SCENARIOS) as ScenarioId[]).map((k) => {
              const sc = SCENARIOS[k];
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>
                      {sc.emoji} {t(`scenarios.${k}.label`)}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>
                      {fmt(REVENUE[k][hIdx])}
                    </span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
                    <div
                      style={{
                        width: `${(REVENUE[k][hIdx] / REVENUE.optimistic[hIdx]) * 100}%`,
                        height: "100%",
                        background: sc.color,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: C.sub }}>
                      EBITDA: {fmt(EBITDA[k][hIdx])}
                    </span>
                    <span style={{ fontSize: 10, color: C.sub }}>EV: {fmt(EV[k][hIdx])}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              background: `${C.gold}11`,
              border: `1px solid ${C.gold}44`,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 6 }}>
              {t("overview.billionTitle")}
            </div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.7 }}>
              <Trans
                i18nKey="overview.billionBaseLine"
                components={[<strong style={{ color: C.green }} />]}
              />
              <br />
              <Trans
                i18nKey="overview.billionOptimisticLine"
                components={[<strong style={{ color: "#667EEA" }} />]}
              />
              <br />
              {t("overview.billionConservativeLine")}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("overview.assumptionsTitle", { label: scenLabel })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            {
              l: t("overview.assumption.waccLabel"),
              v: `${s.wacc * 100}%`,
              d: t("overview.assumption.waccNote"),
            },
            {
              l: t("overview.assumption.multLabel"),
              v: `${s.exitMult}× EBITDA`,
              d: t("overview.assumption.multNote"),
            },
            {
              l: t("overview.assumption.cagrLabel"),
              v: "8.3%",
              d: t("overview.assumption.cagrNote"),
            },
            {
              l: t("overview.assumption.importsLabel"),
              v: "25–30%",
              d: t("overview.assumption.importsNote"),
            },
          ].map((a, i) => (
            <div key={i} style={{ background: C.light, borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 10, color: C.sub }}>{a.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{a.v}</div>
              <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>{a.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CapexOpex = () => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const totalDone = CAPEX_UNITS.reduce((s, u) => s + u.done, 0);
  const totalNeed = CAPEX_UNITS.reduce((s, u) => s + u.need, 0);
  const phases = [
    {
      p: 1,
      label: t("capex.phase1"),
      color: C.green,
      units: CAPEX_UNITS.filter((u) => u.phase === 1),
    },
    {
      p: 2,
      label: t("capex.phase2"),
      color: C.gold,
      units: CAPEX_UNITS.filter((u) => u.phase === 2),
    },
    {
      p: 3,
      label: t("capex.phase3"),
      color: "#F6AD55",
      units: CAPEX_UNITS.filter((u) => u.phase === 3),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "Georgia,serif" }}>
          {t("capex.title")}
        </h2>
        <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
          <span>
            <span style={{ color: C.green, fontWeight: 700 }}>{fmt(totalDone, 1)}</span>{" "}
            <span style={{ color: C.sub }}>{t("capex.headerDone")}</span>
          </span>
          <span>
            <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(totalNeed, 1)}</span>{" "}
            <span style={{ color: C.sub }}>{t("capex.headerNeed")}</span>
          </span>
          <span>
            <span style={{ color: C.text, fontWeight: 700 }}>
              {fmt(totalDone + totalNeed, 1)}
            </span>{" "}
            <span style={{ color: C.sub }}>{t("capex.headerTotal")}</span>
          </span>
        </div>
      </div>

      {phases.map((ph) => (
        <div key={ph.p} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: ph.color,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              marginBottom: 8,
              borderBottom: `1px solid ${ph.color}33`,
              paddingBottom: 6,
            }}
          >
            {ph.label} ·{" "}
            {t("capex.phaseTotal", {
              value: fmt(ph.units.reduce((s, u) => s + u.done + u.need, 0), 1),
            })}
          </div>
          {ph.units.map((u, i) => {
            const total = u.done + u.need;
            const pctDone = total > 0 ? (u.done / total) * 100 : 0;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 80px 80px 90px",
                  gap: 12,
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: u.color }}>
                  [{u.code}] {t(`capex.units.${u.code}`)}
                </span>
                <div style={{ background: C.light, borderRadius: 3, height: 8 }}>
                  <div
                    style={{
                      width: `${pctDone}%`,
                      height: "100%",
                      background: pctDone === 100 ? C.green : ph.color,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: C.green, textAlign: "right" }}>
                  {u.done > 0 ? `✓ ${fmt(u.done, 1)}` : "—"}
                </span>
                <span style={{ fontSize: 11, color: ph.color, textAlign: "right" }}>
                  {u.need > 0 ? `↑ ${fmt(u.need, 1)}` : "—"}
                </span>
                <span style={{ fontSize: 10, color: C.sub, textAlign: "right" }}>
                  {t("common.concluded", { n: pctDone.toFixed(0) })}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            {t("capex.opexTitle")}
          </div>
          {OPEX_ITEMS.map((o, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "7px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.text }}>
                  {t(`capex.opexItems.${o.key}.label`)}
                </div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>
                  {t(`capex.opexItems.${o.key}.note`)}
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginLeft: 12 }}>
                {(o as any).fixed || (o as any).pct}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            {t("capex.capexChartTitle")}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={CAPEX_UNITS.map((u) => ({
                name: u.code,
                realized: u.done,
                pending: u.need,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="name" stroke={C.sub} tick={{ fill: C.sub, fontSize: 11 }} />
              <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} />
              <CT />
              <Bar dataKey="realized" stackId="a" fill={C.green} name={t("capex.barRealized")} />
              <Bar
                dataKey="pending"
                stackId="a"
                fill={C.gold}
                name={t("capex.barPending")}
                radius={[3, 3, 0, 0]}
              />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const RevenueModel = ({ scenario, horizon }: { scenario: ScenarioId; horizon: number }) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const s = SCENARIOS[scenario];
  const scenLabel = t(`scenarios.${scenario}.label`);
  const yrs = YEARS.slice(0, horizon);

  const allData = yrs
    .map((_y, i) => ({
      year: _y,
      SVD:
        (UNIT_REV_BASE[0] as any)[`y${horizon}`] *
        [0.06, 0.13, 0.22, 0.32, 0.4, 0.48, 0.54, 0.59, 0.63, 0.67, 0.7, 0.73][i],
      OKV:
        (UNIT_REV_BASE[1] as any)[`y${horizon}`] *
        [0, 0.08, 0.22, 0.4, 0.55, 0.66, 0.74, 0.81, 0.86, 0.9, 0.93, 0.96][i],
      ZMB:
        (UNIT_REV_BASE[2] as any)[`y${horizon}`] *
        [0, 0, 0.12, 0.28, 0.45, 0.58, 0.68, 0.76, 0.82, 0.88, 0.93, 0.97][i],
      FPT:
        (UNIT_REV_BASE[3] as any)[`y${horizon}`] *
        [0, 0.12, 0.26, 0.42, 0.55, 0.66, 0.74, 0.81, 0.87, 0.92, 0.95, 0.97][i],
      "NTA+AKF":
        ((UNIT_REV_BASE[4] as any)[`y${horizon}`] +
          (UNIT_REV_BASE[5] as any)[`y${horizon}`]) *
        [0.15, 0.28, 0.42, 0.58, 0.68, 0.76, 0.83, 0.88, 0.92, 0.95, 0.97, 0.99][i],
      "PTL+SQA":
        (UNIT_REV_BASE[6] as any)[`y${horizon}`] *
        [0, 0, 0.04, 0.14, 0.28, 0.44, 0.57, 0.67, 0.76, 0.83, 0.89, 0.94][i],
    }))
    .map((d) => {
      Object.keys(d).forEach((k) => {
        if (k !== "year") (d as any)[k] = +(d as any)[k].toFixed(1);
      });
      return d;
    });

  const scaleF = scenario === "conservative" ? 0.73 : scenario === "optimistic" ? 1.32 : 1.0;
  const scaledData = allData.map((d) => {
    const nd: any = { year: d.year };
    Object.keys(d).forEach((k) => {
      if (k !== "year") nd[k] = +((d as any)[k] * scaleF).toFixed(1);
    });
    return nd;
  });

  const unitColors = ["#48BB78", "#C9A84C", "#F6AD55", "#667EEA", "#76E4F7", "#B794F4"];
  const unitKeys = ["SVD", "OKV", "ZMB", "FPT", "NTA+AKF", "PTL+SQA"];

  const utilFor = (kind: string) => {
    const map: Record<string, Record<ScenarioId, string>> = {
      sanep: {
        conservative: "50–65%",
        base: "60–75%",
        optimistic: "70–85%",
      },
      okavango: {
        conservative: "25–45%",
        base: "35–60%",
        optimistic: "45–75%",
      },
      zambezi: {
        conservative: "40–60%",
        base: "50–70%",
        optimistic: "65–80%",
      },
      fibrex: {
        conservative: "30–50%",
        base: "40–60%",
        optimistic: "50–75%",
      },
    };
    return map[kind][scenario];
  };

  // ─── Consolidated KPIs ────────────────────────────────────────────────
  const hIdx = horizon - 1;
  const totalH = REVENUE[scenario][hIdx];
  const totalY1 = REVENUE[scenario][0];
  const cagr = (Math.pow(totalH / Math.max(totalY1, 0.1), 1 / Math.max(horizon - 1, 1)) - 1) * 100;
  const mixAtH = unitKeys.map((k, i) => ({
    name: t(`revenues.unitsShort.${k}`),
    value: scaledData[hIdx][k] as number,
    color: unitColors[i],
  }));
  const sortedMix = [...mixAtH].sort((a, b) => b.value - a.value);
  const topUnit = sortedMix[0];
  const activeUnits = mixAtH.filter((m) => m.value > 0.5).length;
  const totalByYearAllScenarios = YEARS.slice(0, horizon).map((y, i) => ({
    year: y,
    conservative: REVENUE.conservative[i],
    base: REVENUE.base[i],
    optimistic: REVENUE.optimistic[i],
  }));

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: "Georgia,serif",
          marginBottom: 16,
        }}
      >
        {t("revenues.title")}
      </h2>

      {/* ─── Consolidated section ───────────────────────────────────────── */}
      <div
        style={{
          fontSize: 11,
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          marginBottom: 10,
          borderBottom: `1px solid ${C.gold}33`,
          paddingBottom: 6,
        }}
      >
        {t("revenues.consolidatedHeader")}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <KPI
          label={t("revenues.kpiTotal", { n: horizon })}
          value={fmt(totalH)}
          sub={t("revenues.kpiTotalSub", { label: scenLabel })}
          color={s.color}
        />
        <KPI
          label={t("revenues.kpiCagr", { n: horizon })}
          value={`${cagr.toFixed(1)}%`}
          sub={t("revenues.kpiCagrSub")}
          color={C.green}
        />
        <KPI
          label={t("revenues.kpiTopUnit")}
          value={topUnit?.name ?? "—"}
          sub={`${fmt(topUnit?.value ?? 0)} · ${((topUnit?.value ?? 0) / Math.max(totalH, 0.1) * 100).toFixed(0)}%`}
          color={topUnit?.color}
        />
        <KPI
          label={t("revenues.kpiActiveUnits")}
          value={`${activeUnits}/7`}
          sub={t("revenues.kpiActiveUnitsSub", { n: horizon })}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.55fr 1fr",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            {t("revenues.totalChartTitle", { n: horizon })}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={totalByYearAllScenarios}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 11 }} />
              <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
              <CT />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="conservative"
                stroke={SCENARIOS.conservative.color}
                strokeWidth={scenario === "conservative" ? 3 : 1.5}
                dot={false}
                name={t("scenarios.conservative.label")}
              />
              <Line
                type="monotone"
                dataKey="base"
                stroke={SCENARIOS.base.color}
                strokeWidth={scenario === "base" ? 3 : 1.5}
                dot={false}
                name={t("scenarios.base.label")}
              />
              <Line
                type="monotone"
                dataKey="optimistic"
                stroke={SCENARIOS.optimistic.color}
                strokeWidth={scenario === "optimistic" ? 3 : 1.5}
                dot={false}
                name={t("scenarios.optimistic.label")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 12,
            }}
          >
            {t("revenues.mixTitle", { n: horizon })}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={mixAtH.filter((m) => m.value > 0)}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                stroke={C.card}
              >
                {mixAtH
                  .filter((m) => m.value > 0)
                  .map((m, i) => (
                    <Cell key={i} fill={m.color} />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  fontSize: 11,
                }}
                formatter={(v: number, n: string) => [fmt(v), n]}
              />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Unit-by-unit section ───────────────────────────────────────── */}
      <div
        style={{
          fontSize: 11,
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          marginBottom: 10,
          marginTop: 6,
          borderBottom: `1px solid ${C.gold}33`,
          paddingBottom: 6,
        }}
      >
        {t("revenues.unitByUnitHeader")}
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          {t("revenues.consolidatedTitle", { label: scenLabel, n: horizon })}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={scaledData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 11 }} />
            <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
            <CT />
            <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
            {unitKeys.map((k, i) => (
              <Bar
                key={k}
                dataKey={k}
                stackId="a"
                fill={unitColors[i]}
                name={t(`revenues.unitsShort.${k}`)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {UNIT_REV_BASE.map((u, i) => (
          <div
            key={i}
            style={{
              background: C.card,
              border: `1px solid ${u.color}44`,
              borderRadius: 7,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: u.color, marginBottom: 6 }}>
              {t(`revenues.units.${u.key}`)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[5, 7, 12].map((h) => (
                <div key={h} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.sub }}>{t("common.year", { n: h })}</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: h === horizon ? u.color : C.sub,
                    }}
                  >
                    {fmt(
                      +(
                        (u as any)[`y${h}`] *
                        (scenario === "conservative"
                          ? 0.73
                          : scenario === "optimistic"
                            ? 1.32
                            : 1.0)
                      ).toFixed(0),
                      0
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("revenues.capacityTitle")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {(["sanep", "okavango", "zambezi", "fibrex"] as const).map((kind, i) => (
            <div key={i} style={{ background: C.light, borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                {t(`revenues.capacity.${kind}.name`)}
              </div>
              <div style={{ fontSize: 10, color: C.sub }}>
                {t("revenues.capLabel", { value: t(`revenues.capacity.${kind}.cap`) })}
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, margin: "3px 0" }}>
                {t("revenues.utilLabel", { value: utilFor(kind) })}
              </div>
              <div style={{ fontSize: 10, color: C.sub }}>
                {t(`revenues.capacity.${kind}.note`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ValuationScreen = ({ scenario, horizon }: { scenario: ScenarioId; horizon: number }) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const s = SCENARIOS[scenario];
  const scenLabel = t(`scenarios.${scenario}.label`);
  const dcf = calcDCF(scenario, horizon);
  const pmDCF = PRE_MONEY_DCF[scenario][horizon];

  const dcfData = (Object.keys(PRE_MONEY_DCF) as ScenarioId[]).map((k) => ({
    scenario: t(`scenarios.${k}.label`),
    y5: PRE_MONEY_DCF[k][5],
    y7: PRE_MONEY_DCF[k][7],
    y12: PRE_MONEY_DCF[k][12],
  }));

  const methods = [
    {
      method: t("valuation.methodDcf"),
      value: pmDCF,
      weight: "40%",
      note: t("valuation.methodDcfNote", { wacc: s.wacc * 100, n: horizon }),
    },
    {
      method: t("valuation.methodMult", { mult: s.exitMult }),
      value: +(
        (EBITDA[scenario][horizon - 1] * s.exitMult) /
        Math.pow(1 + s.wacc, horizon)
      ).toFixed(0),
      weight: "40%",
      note: t("valuation.methodMultNote"),
    },
    {
      method: t("valuation.methodAssets"),
      value: 25,
      weight: "20%",
      note: t("valuation.methodAssetsNote"),
    },
  ];

  const peerKeys = ["aspen", "cipla", "eipico", "universal", "cifab"] as const;
  const peerMults = ["8–10×", "12–15×", "9–11×", "10–12×", "8–12×"];

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: "Georgia,serif",
          marginBottom: 16,
        }}
      >
        {t("valuation.title")}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <KPI
          label={t("valuation.kpiDcf")}
          value={fmt(pmDCF)}
          sub={t("valuation.kpiDcfSub", { label: scenLabel, n: horizon })}
          color={s.color}
          big
        />
        <KPI
          label={t("valuation.kpiPvFcf")}
          value={fmt(dcf.pvFCF)}
          sub={t("valuation.kpiPvFcfSub")}
          color={dcf.pvFCF > 0 ? C.green : C.red}
        />
        <KPI
          label={t("valuation.kpiPvTv")}
          value={fmt(dcf.tv)}
          sub={t("valuation.kpiPvTvSub", { mult: s.exitMult, n: horizon })}
        />
        <KPI
          label={t("valuation.kpiFloor")}
          value="$25M"
          sub={t("valuation.kpiFloorSub")}
          color={C.sub}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}
      >
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {t("valuation.methodsTitle")}
          </div>
          {methods.map((m, i) => {
            const isSelected = i < 2;
            return (
              <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                      {m.method}
                    </span>
                    <span style={{ fontSize: 10, color: C.sub, marginLeft: 8 }}>
                      {t("common.weight", { n: 40 })}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: isSelected ? s.color : C.sub,
                    }}
                  >
                    {fmt(m.value, 0)}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    background: C.light,
                    borderRadius: 3,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min((m.value / pmDCF) * 100, 100)}%`,
                      height: "100%",
                      background: isSelected ? s.color : C.sub,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: C.sub }}>{m.note}</div>
              </div>
            );
          })}
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: `${s.color}11`,
              border: `1px solid ${s.color}44`,
              borderRadius: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
              {t("valuation.weightedValuation")}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: s.color }}>
              {fmt(pmDCF, 0)}
            </span>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 14,
            }}
          >
            {t("valuation.matrixTitle")}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dcfData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
              <YAxis
                dataKey="scenario"
                type="category"
                stroke={C.sub}
                tick={{ fill: C.sub, fontSize: 11 }}
                width={90}
              />
              <CT />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
              {(["y5", "y7", "y12"] as const).map((k, i) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={["#4A5568", "#718096", "#A0AEC0"][i]}
                  barSize={14}
                  name={t("valuation.yearsAxis", { n: [5, 7, 12][i] })}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: C.sub, marginTop: 8 }}>
            {t("valuation.matrixDesc")}
          </div>
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("valuation.peersTitle")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {peerKeys.map((pk, i) => {
            const isCifab = pk === "cifab";
            const rev = t(`valuation.peers.${pk}.rev`);
            return (
              <div
                key={pk}
                style={{
                  background: isCifab ? `${s.color}11` : C.light,
                  border: isCifab ? `1px solid ${s.color}55` : `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: 10,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: isCifab ? s.color : C.text }}>
                  {t(`valuation.peers.${pk}.name`)}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: isCifab ? s.color : C.gold,
                    margin: "4px 0",
                  }}
                >
                  {peerMults[i]}
                </div>
                <div style={{ fontSize: 9, color: C.sub }}>{t(`valuation.peers.${pk}.note`)}</div>
                {rev && <div style={{ fontSize: 9, color: C.sub }}>{rev}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PrePostMoney = ({ scenario }: { scenario: ScenarioId }) => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const s = SCENARIOS[scenario];
  const [ticket, setTicket] = useState(30);
  const [preMoney, setPreMoney] = useState(100);
  const postMoney = preMoney + ticket;
  const dilution = ((ticket / postMoney) * 100).toFixed(1);
  const founderPct = (100 - parseFloat(dilution)).toFixed(1);

  const exitScenarios = [
    { key: "year5Conservative", ev: EV.conservative[4] },
    { key: "year7Base", ev: EV.base[6] },
    { key: "year7Optimistic", ev: EV.optimistic[6] },
    { key: "year12Base", ev: EV.base[11] },
  ];

  const investorReturn = (ev: number) => {
    const equityVal = ev - 50;
    const investorShare = parseFloat(dilution) / 100;
    return equityVal * investorShare;
  };

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: "Georgia,serif",
          marginBottom: 16,
        }}
      >
        {t("premoney.title")}
      </h2>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}
      >
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            {t("premoney.paramsTitle")}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: C.text }}>{t("premoney.preMoneyLabel")}</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>
                {fmt(preMoney, 0)}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              value={preMoney}
              onChange={(e) => setPreMoney(+e.target.value)}
              style={{ width: "100%", accentColor: s.color, height: 4 }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: C.sub,
                marginTop: 2,
              }}
            >
              <span>$50M</span>
              <span style={{ color: C.sub }}>{t("premoney.preMoneyHint")}</span>
              <span>$300M</span>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: C.text }}>
                {t("premoney.ticketLabel")}
              </label>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>
                {fmt(ticket, 0)}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              value={ticket}
              onChange={(e) => setTicket(+e.target.value)}
              style={{ width: "100%", accentColor: C.gold, height: 4 }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: C.sub,
                marginTop: 2,
              }}
            >
              <span>$5M</span>
              <span>{t("premoney.ticketHint")}</span>
              <span>$80M</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ background: C.light, borderRadius: 7, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>
                {t("premoney.preMoney")}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "Georgia,serif",
                }}
              >
                {fmt(preMoney, 0)}
              </div>
            </div>
            <div style={{ background: C.light, borderRadius: 7, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>
                {t("premoney.postMoney")}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "Georgia,serif",
                }}
              >
                {fmt(postMoney, 0)}
              </div>
            </div>
            <div
              style={{
                background: `${C.gold}22`,
                border: `1px solid ${C.gold}44`,
                borderRadius: 7,
                padding: 14,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>
                {t("premoney.dilution")}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.gold,
                  fontFamily: "Georgia,serif",
                }}
              >
                {dilution}%
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: `${C.green}11`,
              border: `1px solid ${C.green}33`,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>
              {t("premoney.capTable")}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: C.text }}>{t("premoney.founders")}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{founderPct}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: 12, color: C.text }}>{t("premoney.newInvestors")}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{dilution}%</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 16,
            }}
          >
            {t("premoney.returnsTitle")}
          </div>
          {exitScenarios.map((ex, i) => {
            const ret = investorReturn(ex.ev);
            const multiple = (ret / ticket).toFixed(1);
            const isGood = ret > ticket * 2;
            return (
              <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                    {t(`premoney.exits.${ex.key}.label`)}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isGood ? C.green : C.gold,
                    }}
                  >
                    {fmt(ret, 0)}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>
                  {t(`premoney.exits.${ex.key}.desc`)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: isGood ? C.green : C.sub }}>
                    {t("premoney.moic", { x: multiple })}
                  </span>
                  <span style={{ fontSize: 11, color: C.sub }}>
                    · {t("premoney.share", { n: dilution })}
                  </span>
                  <span style={{ fontSize: 11, color: C.sub }}>
                    · {t("premoney.evShort", { value: fmt(ex.ev, 0) })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("premoney.roundsTitle")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {(["a", "b", "c"] as const).map((rk) => (
            <div
              key={rk}
              style={{
                background: C.light,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 3 }}>
                {t(`premoney.rounds.${rk}.rnd`)}
              </div>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 8 }}>
                {t(`premoney.rounds.${rk}.period`)}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: "Georgia,serif",
                  marginBottom: 4,
                }}
              >
                {t(`premoney.rounds.${rk}.ticket`)}
              </div>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}>
                {t("premoney.roundLabels.preMoney")}{" "}
                <span style={{ color: C.text }}>{t(`premoney.rounds.${rk}.preM`)}</span>
              </div>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}>
                {t("premoney.roundLabels.dilution")}{" "}
                <span style={{ color: C.gold }}>{t(`premoney.rounds.${rk}.dilution`)}</span>
              </div>
              <div style={{ fontSize: 10, color: C.sub, marginBottom: 6 }}>
                {t("premoney.roundLabels.use")} {t(`premoney.rounds.${rk}.use`)}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.green,
                  padding: "4px 6px",
                  background: `${C.green}11`,
                  borderRadius: 4,
                }}
              >
                ✓ {t(`premoney.rounds.${rk}.milestones`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BillionPath = () => {
  const { C } = useTheme();
  const { t } = useTranslation();
  const evData = YEARS.map((y, i) => ({
    year: y,
    conservative: EV.conservative[i],
    base: EV.base[i],
    optimistic: EV.optimistic[i],
  }));

  return (
    <div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: "Georgia,serif",
          marginBottom: 6,
        }}
      >
        {t("billion.title")}
      </h2>
      <p style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>{t("billion.intro")}</p>

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: C.sub,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          {t("billion.chartTitle")}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={evData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 11 }} />
            <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
            <CT />
            <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
            <ReferenceLine
              y={1000}
              stroke={C.gold}
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: t("billion.refLabel"),
                position: "insideTopRight",
                fill: C.gold,
                fontSize: 11,
                fontWeight: 700,
              }}
            />
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#ECC94B"
              strokeWidth={2}
              dot={false}
              name={t("billion.chartConservative")}
            />
            <Line
              type="monotone"
              dataKey="base"
              stroke="#48BB78"
              strokeWidth={3}
              dot={false}
              name={t("billion.chartBase")}
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="#667EEA"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
              name={t("billion.chartOptimistic")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 16,
        }}
      >
        {(Object.keys(SCENARIOS) as ScenarioId[]).map((k) => {
          const sc = SCENARIOS[k];
          return (
            <div
              key={k}
              style={{
                background: C.card,
                border: `2px solid ${sc.color}55`,
                borderRadius: 10,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: sc.color, marginBottom: 4 }}>
                {sc.emoji} {t("billion.scenarioPrefix", { label: t(`scenarios.${k}.label`) })}
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 12 }}>
                {t("billion.waccExit", { wacc: sc.wacc * 100, mult: sc.exitMult })}
              </div>
              <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>
                {t("billion.reachedLabel")}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: k === "base" ? C.green : k === "optimistic" ? "#667EEA" : C.red,
                  marginBottom: 12,
                }}
              >
                {t(`billion.billionYear.${k}`)}
              </div>
              {[5, 7, 12].map((h) => (
                <div
                  key={h}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    padding: "5px 8px",
                    background: C.light,
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: C.sub }}>
                    {t("common.evYearLabel", { h, year: 2022 + h + 5 })}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: EV[k][h - 1] >= 1000 ? C.green : sc.color,
                    }}
                  >
                    {EV[k][h - 1] >= 1000 ? `✓ ` : ""}
                    {fmt(EV[k][h - 1], 0)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: `linear-gradient(135deg, ${C.gold}11, ${C.card})`,
          border: `1px solid ${C.gold}44`,
          borderRadius: 10,
          padding: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>
          {t("billion.mathTitle")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {(["s1", "s2", "s3", "s4"] as const).map((sk, i) => (
            <div key={sk} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: `${C.gold}22`,
                  border: `1px solid ${C.gold}`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.gold,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 10, color: C.gold, marginBottom: 2 }}>
                {t(`billion.steps.${sk}.step`)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                {t(`billion.steps.${sk}.label`)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.gold,
                  fontFamily: "Georgia,serif",
                  marginBottom: 4,
                }}
              >
                {t(`billion.steps.${sk}.value`)}
              </div>
              <div style={{ fontSize: 10, color: C.sub }}>{t(`billion.steps.${sk}.sub`)}</div>
              {i < 3 && <div style={{ fontSize: 16, color: C.border, marginTop: 4 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────────────────────
type TabId =
  | "overview"
  | "capex"
  | "revenues"
  | "financials"
  | "indicators"
  | "valuation"
  | "premoney"
  | "billion";
const TAB_IDS: TabId[] = [
  "overview",
  "capex",
  "revenues",
  "financials",
  "indicators",
  "valuation",
  "premoney",
  "billion",
];

export default function App() {
  const { C, mode } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>("overview");
  const [scenario, setScenario] = useState<ScenarioId>("base");
  const [horizon, setHorizon] = useState(7);
  const logoSrc = mode === "dark" ? logoLight : logoDark;

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return <Overview scenario={scenario} horizon={horizon} />;
      case "capex":
        return <CapexOpex />;
      case "revenues":
        return <RevenueModel scenario={scenario} horizon={horizon} />;
      case "financials":
        return <FinancialStatements scenario={scenario} horizon={horizon} />;
      case "indicators":
        return <FinancialIndicators scenario={scenario} horizon={horizon} />;
      case "valuation":
        return <ValuationScreen scenario={scenario} horizon={horizon} />;
      case "premoney":
        return <PrePostMoney scenario={scenario} />;
      case "billion":
        return <BillionPath />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: C.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={logoSrc}
            alt="CIFAB — Complexo Industrial Farmacêutico e Biotecnológico de Luanda"
            style={{ height: 40, width: "auto", display: "block" }}
          />
          <span
            style={{
              fontSize: 11,
              color: C.sub,
              paddingLeft: 12,
              borderLeft: `1px solid ${C.border}`,
              lineHeight: 1.3,
              maxWidth: 220,
            }}
          >
            {t("header.subtitle")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: C.sub, marginRight: 4 }}>
            {t("header.scenarioLabel")}
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((k) => (
            <ScenBtn key={k} id={k} active={scenario === k} onClick={setScenario} />
          ))}
          <span style={{ fontSize: 10, color: C.sub, marginLeft: 8, marginRight: 4 }}>
            {t("header.horizonLabel")}
          </span>
          {[5, 7, 12].map((h) => (
            <HorBtn key={h} h={h} active={horizon === h} onClick={setHorizon} />
          ))}
          <div style={{ width: 1, height: 22, background: C.border, margin: "0 6px" }} />
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: C.card,
          borderBottom: `1px solid ${C.border}`,
          padding: "8px 24px",
          display: "flex",
          gap: 6,
          overflowX: "auto",
        }}
      >
        {TAB_IDS.map((id) => (
          <Tab key={id} id={id} active={tab === id} onClick={(v) => setTab(v as TabId)}>
            {t(`tabs.${id}`)}
          </Tab>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>{renderContent()}</div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "12px",
          borderTop: `1px solid ${C.border}`,
          fontSize: 10,
          color: C.sub,
        }}
      >
        {t("footer", { year: new Date().getFullYear() })}
      </div>
    </div>
  );
}
