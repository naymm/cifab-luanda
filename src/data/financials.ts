import { EBITDA, REVENUE, YEARS, type ScenarioId } from "./model";

// ─── ASSUMPTIONS ──────────────────────────────────────────────────────────
// COGS % declines linearly from 42% (Y1) to 35% (Y12)
const COGS_PCT_Y1 = 0.42;
const COGS_PCT_Y12 = 0.35;
const DSO_DAYS = 75; // Days Sales Outstanding (Accounts Receivable)
const DIO_DAYS = 60; // Days Inventory Outstanding
const DPO_DAYS = 60; // Days Payable Outstanding
const TAX_RATE = 0.25; // Angola corporate income tax
const INTEREST_RATE = 0.09; // Angola corporate borrowing rate

// CAPEX deployment schedule (USD M). Total ≈ $137M (35 deployed + 102 to invest).
// Front-loaded in the Installation Phase (2026–2028).
const CAPEX_SCHEDULE: number[] = [42, 36, 24, 14, 8, 5, 6, 6, 7, 7, 8, 9];
const STARTING_PPE = 35.1; // already deployed
const STARTING_INTANGIBLES = 6;

// Debt schedule (USD M, outstanding at year end)
const DEBT_SCHEDULE: Record<ScenarioId, number[]> = {
  conservative: [40, 55, 65, 70, 70, 65, 60, 55, 50, 45, 40, 35],
  base: [35, 50, 60, 60, 55, 50, 45, 40, 35, 30, 25, 20],
  optimistic: [30, 45, 50, 50, 45, 40, 35, 30, 25, 20, 15, 10],
};

// Paid-in capital schedule per scenario (cumulative, USD M)
const EQUITY_SCHEDULE: Record<ScenarioId, number[]> = {
  conservative: [30, 50, 70, 70, 90, 90, 90, 90, 90, 90, 90, 90],
  base: [30, 55, 75, 105, 105, 140, 140, 140, 140, 140, 140, 140],
  optimistic: [30, 60, 90, 130, 130, 170, 170, 170, 170, 170, 170, 170],
};

// Depreciation life
const DEP_LIFE_YEARS = 10;

// ─── TYPES ────────────────────────────────────────────────────────────────
export interface IncomeStatementYear {
  year: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  ebitda: number;
  da: number;
  ebit: number;
  interest: number;
  ebt: number;
  tax: number;
  netIncome: number;
}

export interface BalanceSheetYear {
  year: string;
  cash: number;
  ar: number;
  inventory: number;
  currentAssets: number;
  ppeGross: number;
  accumDep: number;
  ppeNet: number;
  intangibles: number;
  totalAssets: number;
  ap: number;
  shortDebt: number;
  currentLiab: number;
  longDebt: number;
  totalLiab: number;
  paidInCapital: number;
  retainedEarnings: number;
  totalEquity: number;
  totalLE: number;
}

export interface CashFlowYear {
  year: string;
  netIncome: number;
  da: number;
  changeWC: number;
  ocf: number;
  capex: number;
  icf: number;
  debtChange: number;
  equityIssued: number;
  fcfFinancing: number;
  netChangeCash: number;
  endingCash: number;
}

export interface Financials {
  is: IncomeStatementYear[];
  bs: BalanceSheetYear[];
  cf: CashFlowYear[];
}

// ─── DERIVATION ───────────────────────────────────────────────────────────
const round = (n: number, dec = 1) => +n.toFixed(dec);

function cogsPct(yearIndex: number): number {
  const t = yearIndex / 11; // 0..1 from Y1..Y12
  return COGS_PCT_Y1 + (COGS_PCT_Y12 - COGS_PCT_Y1) * t;
}

export function buildFinancials(scenario: ScenarioId): Financials {
  const revArr = REVENUE[scenario];
  const ebitdaArr = EBITDA[scenario];
  const debtArr = DEBT_SCHEDULE[scenario];
  const equityArr = EQUITY_SCHEDULE[scenario];

  const is: IncomeStatementYear[] = [];
  const bs: BalanceSheetYear[] = [];
  const cf: CashFlowYear[] = [];

  let ppeGross = STARTING_PPE;
  let accumDep = 0;
  let retainedEarnings = -8; // small accumulated loss at start
  let cash = 12; // starting cash
  let prevAR = 0;
  let prevInv = 0;
  let prevAP = 0;
  let prevDebt = 25;
  let prevEquity = 25;

  for (let i = 0; i < YEARS.length; i++) {
    const year = YEARS[i];
    const revenue = revArr[i];
    const ebitda = ebitdaArr[i];
    const pct = cogsPct(i);
    const cogs = round(revenue * pct, 1);
    const grossProfit = round(revenue - cogs, 1);
    const opex = round(grossProfit - ebitda, 1);

    // D&A: straight-line on gross PP&E, with new CAPEX coming in mid-year.
    const capex = CAPEX_SCHEDULE[i];
    const da = round((ppeGross + capex / 2) / DEP_LIFE_YEARS, 1);

    const ebit = round(ebitda - da, 1);
    const debt = debtArr[i];
    const avgDebt = (prevDebt + debt) / 2;
    const interest = round(avgDebt * INTEREST_RATE, 1);
    const ebt = round(ebit - interest, 1);
    const tax = ebt > 0 ? round(ebt * TAX_RATE, 1) : 0;
    const netIncome = round(ebt - tax, 1);

    is.push({
      year,
      revenue,
      cogs,
      grossProfit,
      opex,
      ebitda,
      da,
      ebit,
      interest,
      ebt,
      tax,
      netIncome,
    });

    // Balance sheet — working capital items
    const ar = round((revenue * DSO_DAYS) / 365, 1);
    const inventory = round((cogs * DIO_DAYS) / 365, 1);
    const ap = round((cogs * DPO_DAYS) / 365, 1);
    ppeGross = round(ppeGross + capex, 1);
    accumDep = round(accumDep + da, 1);
    const ppeNet = round(ppeGross - accumDep, 1);
    const intangibles = round(STARTING_INTANGIBLES + i * 0.4, 1);

    // Cash flow
    const changeWC = round(ar - prevAR + (inventory - prevInv) - (ap - prevAP), 1);
    const ocf = round(netIncome + da - changeWC, 1);
    const icf = round(-capex, 1);
    const debtChange = round(debt - prevDebt, 1);
    const paidInCapital = equityArr[i];
    const equityIssued = round(paidInCapital - prevEquity, 1);
    const fcfFinancing = round(debtChange + equityIssued, 1);
    const netChangeCash = round(ocf + icf + fcfFinancing, 1);
    cash = round(cash + netChangeCash, 1);
    retainedEarnings = round(retainedEarnings + netIncome, 1);

    const currentAssets = round(cash + ar + inventory, 1);
    const totalAssets = round(currentAssets + ppeNet + intangibles, 1);

    // Split long/short debt: 20% short-term, 80% long-term (simplification)
    const shortDebt = round(debt * 0.2, 1);
    const longDebt = round(debt - shortDebt, 1);
    const currentLiab = round(ap + shortDebt, 1);
    const totalLiab = round(currentLiab + longDebt, 1);
    const totalEquity = round(paidInCapital + retainedEarnings, 1);
    const totalLE = round(totalLiab + totalEquity, 1);

    bs.push({
      year,
      cash,
      ar,
      inventory,
      currentAssets,
      ppeGross,
      accumDep,
      ppeNet,
      intangibles,
      totalAssets,
      ap,
      shortDebt,
      currentLiab,
      longDebt,
      totalLiab,
      paidInCapital,
      retainedEarnings,
      totalEquity,
      totalLE,
    });

    cf.push({
      year,
      netIncome,
      da,
      changeWC,
      ocf,
      capex,
      icf,
      debtChange,
      equityIssued,
      fcfFinancing,
      netChangeCash,
      endingCash: cash,
    });

    prevAR = ar;
    prevInv = inventory;
    prevAP = ap;
    prevDebt = debt;
    prevEquity = paidInCapital;
  }

  return { is, bs, cf };
}
