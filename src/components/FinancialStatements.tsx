import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
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
import { buildFinancials } from "../data/financials";
import { FinancialTable, type Row } from "./FinancialTable";

type Sub = "is" | "bs" | "cf";

export function FinancialStatements({
  scenario,
  horizon,
}: {
  scenario: ScenarioId;
  horizon: number;
}) {
  const { C } = useTheme();
  const { t } = useTranslation();
  const [sub, setSub] = useState<Sub>("is");
  const financials = useMemo(() => buildFinancials(scenario), [scenario]);
  const scenLabel = t(`scenarios.${scenario}.label`);
  const s = SCENARIOS[scenario];

  const years = financials.is.map((r) => r.year);
  const highlightCol = horizon - 1;

  const isRows: Row[] = [
    {
      key: "is-rev-h",
      label: t("financials.is.revenueSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "revenue",
      label: t("financials.is.revenue"),
      values: financials.is.map((r) => r.revenue),
    },
    {
      key: "cogs",
      label: t("financials.is.cogs"),
      values: financials.is.map((r) => -r.cogs),
    },
    {
      key: "gp",
      label: t("financials.is.grossProfit"),
      values: financials.is.map((r) => r.grossProfit),
      type: "subtotal",
    },
    {
      key: "is-opex-h",
      label: t("financials.is.opexSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "opex",
      label: t("financials.is.opex"),
      values: financials.is.map((r) => -r.opex),
    },
    {
      key: "ebitda",
      label: t("financials.is.ebitda"),
      values: financials.is.map((r) => r.ebitda),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "da",
      label: t("financials.is.da"),
      values: financials.is.map((r) => -r.da),
    },
    {
      key: "ebit",
      label: t("financials.is.ebit"),
      values: financials.is.map((r) => r.ebit),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "interest",
      label: t("financials.is.interest"),
      values: financials.is.map((r) => -r.interest),
    },
    {
      key: "ebt",
      label: t("financials.is.ebt"),
      values: financials.is.map((r) => r.ebt),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "tax",
      label: t("financials.is.tax"),
      values: financials.is.map((r) => -r.tax),
    },
    {
      key: "ni",
      label: t("financials.is.netIncome"),
      values: financials.is.map((r) => r.netIncome),
      type: "total",
      emphasizeSign: true,
    },
  ];

  const bsRows: Row[] = [
    {
      key: "bs-current-assets",
      label: t("financials.bs.currentAssetsSection"),
      values: years.map(() => 0),
      type: "header",
    },
    { key: "cash", label: t("financials.bs.cash"), values: financials.bs.map((r) => r.cash), indent: 1 },
    { key: "ar", label: t("financials.bs.ar"), values: financials.bs.map((r) => r.ar), indent: 1 },
    {
      key: "inv",
      label: t("financials.bs.inventory"),
      values: financials.bs.map((r) => r.inventory),
      indent: 1,
    },
    {
      key: "ca-total",
      label: t("financials.bs.currentAssetsTotal"),
      values: financials.bs.map((r) => r.currentAssets),
      type: "subtotal",
    },
    {
      key: "bs-nca",
      label: t("financials.bs.nonCurrentAssetsSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "ppe-gross",
      label: t("financials.bs.ppeGross"),
      values: financials.bs.map((r) => r.ppeGross),
      indent: 1,
    },
    {
      key: "ppe-dep",
      label: t("financials.bs.accumDep"),
      values: financials.bs.map((r) => -r.accumDep),
      indent: 1,
    },
    {
      key: "ppe-net",
      label: t("financials.bs.ppeNet"),
      values: financials.bs.map((r) => r.ppeNet),
      indent: 1,
    },
    {
      key: "intang",
      label: t("financials.bs.intangibles"),
      values: financials.bs.map((r) => r.intangibles),
      indent: 1,
    },
    {
      key: "ta",
      label: t("financials.bs.totalAssets"),
      values: financials.bs.map((r) => r.totalAssets),
      type: "total",
    },
    {
      key: "bs-cl",
      label: t("financials.bs.currentLiabSection"),
      values: years.map(() => 0),
      type: "header",
    },
    { key: "ap", label: t("financials.bs.ap"), values: financials.bs.map((r) => r.ap), indent: 1 },
    {
      key: "sd",
      label: t("financials.bs.shortDebt"),
      values: financials.bs.map((r) => r.shortDebt),
      indent: 1,
    },
    {
      key: "cl-total",
      label: t("financials.bs.currentLiabTotal"),
      values: financials.bs.map((r) => r.currentLiab),
      type: "subtotal",
    },
    {
      key: "ld",
      label: t("financials.bs.longDebt"),
      values: financials.bs.map((r) => r.longDebt),
    },
    {
      key: "tl",
      label: t("financials.bs.totalLiab"),
      values: financials.bs.map((r) => r.totalLiab),
      type: "subtotal",
    },
    {
      key: "bs-eq",
      label: t("financials.bs.equitySection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "pic",
      label: t("financials.bs.paidInCapital"),
      values: financials.bs.map((r) => r.paidInCapital),
      indent: 1,
    },
    {
      key: "re",
      label: t("financials.bs.retainedEarnings"),
      values: financials.bs.map((r) => r.retainedEarnings),
      indent: 1,
      emphasizeSign: true,
    },
    {
      key: "te",
      label: t("financials.bs.totalEquity"),
      values: financials.bs.map((r) => r.totalEquity),
      type: "subtotal",
    },
    {
      key: "tle",
      label: t("financials.bs.totalLE"),
      values: financials.bs.map((r) => r.totalLE),
      type: "total",
    },
  ];

  const cfRows: Row[] = [
    {
      key: "cf-op",
      label: t("financials.cf.operatingSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "ni-cf",
      label: t("financials.cf.netIncome"),
      values: financials.cf.map((r) => r.netIncome),
      indent: 1,
      emphasizeSign: true,
    },
    { key: "da-cf", label: t("financials.cf.da"), values: financials.cf.map((r) => r.da), indent: 1 },
    {
      key: "wc",
      label: t("financials.cf.changeWC"),
      values: financials.cf.map((r) => -r.changeWC),
      indent: 1,
      emphasizeSign: true,
    },
    {
      key: "ocf",
      label: t("financials.cf.ocf"),
      values: financials.cf.map((r) => r.ocf),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "cf-inv",
      label: t("financials.cf.investingSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "capex-cf",
      label: t("financials.cf.capex"),
      values: financials.cf.map((r) => r.icf),
      indent: 1,
      emphasizeSign: true,
    },
    {
      key: "icf",
      label: t("financials.cf.icf"),
      values: financials.cf.map((r) => r.icf),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "cf-fin",
      label: t("financials.cf.financingSection"),
      values: years.map(() => 0),
      type: "header",
    },
    {
      key: "debt-iss",
      label: t("financials.cf.debtChange"),
      values: financials.cf.map((r) => r.debtChange),
      indent: 1,
      emphasizeSign: true,
    },
    {
      key: "eq-iss",
      label: t("financials.cf.equityIssued"),
      values: financials.cf.map((r) => r.equityIssued),
      indent: 1,
    },
    {
      key: "fcf-fin",
      label: t("financials.cf.fcfFinancing"),
      values: financials.cf.map((r) => r.fcfFinancing),
      type: "subtotal",
    },
    {
      key: "net-change",
      label: t("financials.cf.netChangeCash"),
      values: financials.cf.map((r) => r.netChangeCash),
      type: "subtotal",
      emphasizeSign: true,
    },
    {
      key: "end-cash",
      label: t("financials.cf.endingCash"),
      values: financials.cf.map((r) => r.endingCash),
      type: "total",
    },
  ];

  const rowsFor: Record<Sub, Row[]> = {
    is: isRows,
    bs: bsRows,
    cf: cfRows,
  };

  // Mini chart data per sub-tab
  const trendData = years.map((y, i) => ({
    year: y,
    revenue: financials.is[i].revenue,
    ebitda: financials.is[i].ebitda,
    netIncome: financials.is[i].netIncome,
    totalAssets: financials.bs[i].totalAssets,
    totalEquity: financials.bs[i].totalEquity,
    totalDebt: financials.bs[i].shortDebt + financials.bs[i].longDebt,
    ocf: financials.cf[i].ocf,
    icf: financials.cf[i].icf,
    fcfFin: financials.cf[i].fcfFinancing,
    endingCash: financials.cf[i].endingCash,
  }));

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
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.text,
              fontFamily: "Georgia,serif",
              marginBottom: 4,
            }}
          >
            {t("financials.title")}
          </h2>
          <div style={{ fontSize: 11, color: s.color, letterSpacing: "0.08em" }}>
            {t("common.scenarioHorizon", { label: scenLabel, n: horizon })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["is", "bs", "cf"] as const).map((k) => {
            const active = sub === k;
            return (
              <button
                key={k}
                onClick={() => setSub(k)}
                style={{
                  background: active ? `${C.gold}22` : "transparent",
                  color: active ? C.gold : C.sub,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  borderRadius: 5,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {t(`financials.subTabs.${k}`)}
              </button>
            );
          })}
        </div>
      </div>

      {sub === "is" && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
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
            {t("financials.charts.isTrend")}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} />
              <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
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
                type="monotone"
                dataKey="revenue"
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                name={t("financials.is.revenue")}
              />
              <Line
                type="monotone"
                dataKey="ebitda"
                stroke={C.green}
                strokeWidth={2}
                dot={false}
                name={t("financials.is.ebitda")}
              />
              <Line
                type="monotone"
                dataKey="netIncome"
                stroke={C.gold}
                strokeWidth={2}
                dot={false}
                name={t("financials.is.netIncome")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sub === "bs" && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
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
            {t("financials.charts.bsTrend")}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} />
              <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
              <Tooltip
                contentStyle={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  fontSize: 11,
                }}
              />
              <Legend wrapperStyle={{ color: C.sub, fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="totalAssets"
                stroke={s.color}
                fill={`${s.color}33`}
                name={t("financials.bs.totalAssets")}
              />
              <Area
                type="monotone"
                dataKey="totalEquity"
                stroke={C.green}
                fill={`${C.green}33`}
                name={t("financials.bs.totalEquity")}
              />
              <Area
                type="monotone"
                dataKey="totalDebt"
                stroke={C.red}
                fill={`${C.red}33`}
                name={t("financials.bs.totalDebt")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {sub === "cf" && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
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
            {t("financials.charts.cfTrend")}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} />
              <YAxis stroke={C.sub} tick={{ fill: C.sub, fontSize: 10 }} unit="M" />
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
                type="monotone"
                dataKey="ocf"
                stroke={C.green}
                strokeWidth={2}
                dot={false}
                name={t("financials.cf.ocf")}
              />
              <Line
                type="monotone"
                dataKey="icf"
                stroke={C.red}
                strokeWidth={2}
                dot={false}
                name={t("financials.cf.icf")}
              />
              <Line
                type="monotone"
                dataKey="fcfFin"
                stroke={C.gold}
                strokeWidth={2}
                dot={false}
                name={t("financials.cf.fcfFinancing")}
              />
              <Line
                type="monotone"
                dataKey="endingCash"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                name={t("financials.cf.endingCash")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <FinancialTable years={years} rows={rowsFor[sub]} highlightCol={highlightCol} />

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
        {t("financials.note")}
      </div>
    </div>
  );
}
