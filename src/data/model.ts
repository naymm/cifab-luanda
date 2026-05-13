export const YEARS = [
  "2027",
  "2028",
  "2029",
  "2030",
  "2031",
  "2032",
  "2033",
  "2034",
  "2035",
  "2036",
  "2037",
  "2038",
] as const;

export const SCENARIOS = {
  conservative: { id: "conservative", emoji: "🛡️", wacc: 0.22, tGrowth: 0.05, exitMult: 8, color: "#ECC94B" },
  base: { id: "base", emoji: "⚖️", wacc: 0.2, tGrowth: 0.05, exitMult: 10, color: "#48BB78" },
  optimistic: { id: "optimistic", emoji: "🚀", wacc: 0.18, tGrowth: 0.05, exitMult: 12, color: "#667EEA" },
} as const;

export type ScenarioId = keyof typeof SCENARIOS;
export const SCENARIO_IDS: ScenarioId[] = ["conservative", "base", "optimistic"];

// Revenue (USD M) — 12 years
export const REVENUE: Record<ScenarioId, number[]> = {
  conservative: [14, 38, 72, 105, 130, 155, 178, 196, 212, 224, 238, 248],
  base: [22, 68, 145, 210, 265, 315, 355, 390, 420, 445, 468, 490],
  optimistic: [30, 95, 205, 300, 385, 465, 535, 595, 645, 688, 724, 755],
};

export const EBITDA: Record<ScenarioId, number[]> = {
  conservative: [1.7, 5.7, 12.2, 19.4, 26.0, 33.1, 39.2, 45.1, 50.9, 55.5, 60.8, 64.5],
  base: [3.1, 11.6, 28.3, 46.2, 66.3, 85.1, 97.6, 109.2, 121.8, 131.3, 141.7, 151.9],
  optimistic: [4.8, 19.0, 45.1, 75.0, 107.8, 139.5, 166.9, 190.4, 212.9, 234.0, 254.5, 274.2],
};

export const EBITDA_PCT: Record<ScenarioId, number[]> = {
  conservative: [12, 15, 17, 18, 20, 21, 22, 23, 24, 25, 26, 26],
  base: [14, 17, 20, 22, 25, 27, 27, 28, 29, 30, 30, 31],
  optimistic: [16, 20, 22, 25, 28, 30, 31, 32, 33, 34, 35, 36],
};

export const FCF: Record<ScenarioId, number[]> = {
  conservative: [-20, -15, -5, 8, 18, 26, 32, 38, 44, 50, 55, 58],
  base: [-18, -8, 12, 28, 45, 62, 74, 86, 98, 108, 118, 126],
  optimistic: [-12, 2, 25, 50, 80, 108, 132, 155, 175, 195, 212, 230],
};

export const EV: Record<ScenarioId, number[]> = {
  conservative: EBITDA.conservative.map((e) => +(e * 8).toFixed(0)),
  base: EBITDA.base.map((e) => +(e * 10).toFixed(0)),
  optimistic: EBITDA.optimistic.map((e) => +(e * 12).toFixed(0)),
};

export const PRE_MONEY_DCF: Record<ScenarioId, Record<number, number>> = {
  conservative: { 5: 48, 7: 80, 12: 103 },
  base: { 5: 155, 7: 200, 12: 309 },
  optimistic: { 5: 440, 7: 580, 12: 793 },
};

export const CAPEX_UNITS = [
  { code: "SVD", done: 6.5, need: 4.2, phase: 1, color: "#48BB78" },
  { code: "OKV", done: 8.2, need: 15.2, phase: 2, color: "#C9A84C" },
  { code: "FPT", done: 2.0, need: 16.0, phase: 2, color: "#667EEA" },
  { code: "ZMB", done: 0, need: 22.5, phase: 3, color: "#F6AD55" },
  { code: "NTA", done: 3.0, need: 5.0, phase: 1, color: "#68D391" },
  { code: "AKF", done: 0, need: 3.0, phase: 2, color: "#76E4F7" },
  { code: "PTL", done: 0, need: 5.0, phase: 3, color: "#B794F4" },
  { code: "SQA", done: 0, need: 8.0, phase: 3, color: "#FC8181" },
  { code: "INF", done: 11.4, need: 23.6, phase: 2, color: "#A0AEC0" },
];

export const UNIT_REV_BASE = [
  { key: "sanep", y5: 80, y7: 105, y12: 130, color: "#48BB78" },
  { key: "okavango", y5: 125, y7: 180, y12: 240, color: "#C9A84C" },
  { key: "zambezi", y5: 16, y7: 18, y12: 29, color: "#F6AD55" },
  { key: "fibrex", y5: 12, y7: 15, y12: 20, color: "#667EEA" },
  { key: "nutrition", y5: 9, y7: 12, y12: 18, color: "#68D391" },
  { key: "akiese", y5: 11, y7: 14, y12: 22, color: "#76E4F7" },
  { key: "petris", y5: 7, y7: 11, y12: 21, color: "#B794F4" },
];

export const OPEX_ITEMS = [
  { key: "cogs", pct: "35–42%" },
  { key: "personnel", fixed: "$15.3M/yr" },
  { key: "utilities", fixed: "$4.2M/yr" },
  { key: "regulatory", fixed: "$2.5M/yr" },
  { key: "distribution", pct: "~3%" },
  { key: "ga", fixed: "$5.0M/yr" },
  { key: "maintenance", fixed: "$3.0M/yr" },
  { key: "rnd", fixed: "$2.5M/yr" },
];

// Helpers
export const fmt = (n: any, dec = 1) =>
  typeof n === "number"
    ? n >= 1000
      ? `$${(n / 1000).toFixed(1)}B`
      : `$${n.toFixed(dec)}M`
    : n;

export function calcDCF(scenario: ScenarioId, horizon: number) {
  const scen = SCENARIOS[scenario];
  const fcfs = FCF[scenario].slice(0, horizon);
  const ebitda_final = EBITDA[scenario][horizon - 1];
  let pvFCF = 0;
  fcfs.forEach((f, i) => {
    pvFCF += f / Math.pow(1 + scen.wacc, i + 1);
  });
  const tv = (ebitda_final * scen.exitMult) / Math.pow(1 + scen.wacc, horizon);
  return { pvFCF: +pvFCF.toFixed(1), tv: +tv.toFixed(1), total: +(pvFCF + tv).toFixed(1) };
}
