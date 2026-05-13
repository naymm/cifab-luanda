import { EV, YEARS, type ScenarioId } from "./model";
import { buildFinancials, type Financials } from "./financials";

export interface IndicatorsYear {
  year: string;
  // Profitability (%)
  grossMargin: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
  roic: number;
  // Liquidity (×)
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  // Solvency (× / %)
  debtEquity: number;
  debtEbitda: number;
  interestCoverage: number;
  equityRatio: number;
  // Efficiency
  assetTurnover: number;
  dso: number;
  dio: number;
  dpo: number;
  ccc: number; // Cash conversion cycle (days)
  // Valuation
  evRevenue: number;
  evEbitda: number;
  pe: number;
}

const safeDiv = (a: number, b: number) => (b !== 0 ? a / b : 0);
const round = (n: number, dec = 2) => +n.toFixed(dec);

export function buildIndicators(scenario: ScenarioId): {
  rows: IndicatorsYear[];
  financials: Financials;
} {
  const financials = buildFinancials(scenario);
  const evArr = EV[scenario];
  const rows: IndicatorsYear[] = [];

  for (let i = 0; i < YEARS.length; i++) {
    const isRow = financials.is[i];
    const bsRow = financials.bs[i];
    const totalDebt = bsRow.shortDebt + bsRow.longDebt;
    const investedCapital = totalDebt + bsRow.totalEquity;
    const nopat = isRow.ebit * (1 - 0.25);
    const evY = evArr[i];

    rows.push({
      year: bsRow.year,
      grossMargin: round((isRow.grossProfit / isRow.revenue) * 100, 1),
      ebitdaMargin: round((isRow.ebitda / isRow.revenue) * 100, 1),
      ebitMargin: round((isRow.ebit / isRow.revenue) * 100, 1),
      netMargin: round((isRow.netIncome / isRow.revenue) * 100, 1),
      roe: round((isRow.netIncome / Math.max(bsRow.totalEquity, 0.1)) * 100, 1),
      roa: round((isRow.netIncome / bsRow.totalAssets) * 100, 1),
      roic: round((nopat / Math.max(investedCapital, 0.1)) * 100, 1),
      currentRatio: round(safeDiv(bsRow.currentAssets, bsRow.currentLiab), 2),
      quickRatio: round(
        safeDiv(bsRow.currentAssets - bsRow.inventory, bsRow.currentLiab),
        2
      ),
      cashRatio: round(safeDiv(bsRow.cash, bsRow.currentLiab), 2),
      debtEquity: round(safeDiv(totalDebt, Math.max(bsRow.totalEquity, 0.1)), 2),
      debtEbitda: round(safeDiv(totalDebt, Math.max(isRow.ebitda, 0.1)), 2),
      interestCoverage: round(safeDiv(isRow.ebit, Math.max(isRow.interest, 0.1)), 2),
      equityRatio: round((bsRow.totalEquity / bsRow.totalAssets) * 100, 1),
      assetTurnover: round(safeDiv(isRow.revenue, bsRow.totalAssets), 2),
      dso: round(safeDiv(bsRow.ar, isRow.revenue) * 365, 0),
      dio: round(safeDiv(bsRow.inventory, isRow.cogs) * 365, 0),
      dpo: round(safeDiv(bsRow.ap, isRow.cogs) * 365, 0),
      ccc: round(
        safeDiv(bsRow.ar, isRow.revenue) * 365 +
          safeDiv(bsRow.inventory, isRow.cogs) * 365 -
          safeDiv(bsRow.ap, isRow.cogs) * 365,
        0
      ),
      evRevenue: round(safeDiv(evY, isRow.revenue), 2),
      evEbitda: round(safeDiv(evY, isRow.ebitda), 1),
      pe: round(safeDiv(evY * 0.65, Math.max(isRow.netIncome, 0.1)), 1), // assume equity = 65% EV
    });
  }

  return { rows, financials };
}
