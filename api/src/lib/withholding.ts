/**
 * 2024 federal income tax withholding using the IRS Percentage Method
 * (Publication 15-T, Table for Percentage Method of Withholding).
 *
 * Reference: https://www.irs.gov/pub/irs-pdf/p15t.pdf
 */

export type FilingStatus = 'single' | 'married_jointly' | 'head_of_household';
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'quarterly' | 'annual';

export const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  quarterly: 4,
  annual: 1,
};

// 2024 IRS Table 2 — Adjustment for Step 2 checkbox (multiple jobs)
const STEP2_ADJUSTMENT: Record<FilingStatus, number> = {
  married_jointly:   12900,
  single:             8600,
  head_of_household:  8600,
};

// 2024 Federal income tax brackets (annual) per filing status.
// Each entry: [bracketFloor, tentativeWithholdingAtFloor, marginalRate]
type Bracket = [number, number, number];
const BRACKETS_2024: Record<FilingStatus, Bracket[]> = {
  single: [
    [0,         0,          0.10],
    [11600,     1160,       0.12],
    [47150,     5426,       0.22],
    [100525,    17168.50,   0.24],
    [191950,    39110.50,   0.32],
    [243725,    55678.50,   0.35],
    [609350,    183647.25,  0.37],
  ],
  married_jointly: [
    [0,         0,          0.10],
    [23200,     2320,       0.12],
    [94300,     10852,      0.22],
    [201050,    34337,      0.24],
    [383900,    78221,      0.32],
    [487450,    111357,     0.35],
    [731200,    196669.50,  0.37],
  ],
  head_of_household: [
    [0,         0,          0.10],
    [16550,     1655,       0.12],
    [63100,     7241,       0.22],
    [100500,    15469,      0.24],
    [191950,    37417,      0.32],
    [243700,    53977,      0.35],
    [609350,    181954.50,  0.37],
  ],
};

/** Apply tax brackets to an annualised income, return annual tax owed. */
function applyBrackets(annualIncome: number, status: FilingStatus): number {
  const brackets = BRACKETS_2024[status];
  for (let i = brackets.length - 1; i >= 0; i--) {
    const [floor, base, rate] = brackets[i];
    if (annualIncome > floor) {
      return base + (annualIncome - floor) * rate;
    }
  }
  return 0;
}

export interface W4Elections {
  filingStatus:      FilingStatus;
  multipleJobs:      boolean;
  dependentsAmount:  number;   // Step 3 total (annual credit)
  otherIncome:       number;   // Step 4a annual
  extraDeductions:   number;   // Step 4b annual
  extraWithholding:  number;   // Step 4c per-period
  exempt:            boolean;
}

export interface FicaResult {
  socialSecurity: number;   // 6.2% up to wage base
  medicare:       number;   // 1.45%
}

const SS_WAGE_BASE_2024 = 168600; // Social Security taxable wage base
const SS_RATE           = 0.062;
const MEDICARE_RATE     = 0.0145;

/**
 * Calculate per-period federal withholding from W-4 elections.
 * Returns 0 if employee claimed exempt.
 */
export function computeFederalWithholding(
  periodWage: number,
  frequency:  PayFrequency,
  w4:         W4Elections,
): number {
  if (w4.exempt) return 0;

  const periods = PAY_PERIODS[frequency] ?? 12;

  // Step 1 — Adjusted Annual Wage Equivalent
  let annualWage = periodWage * periods;
  if (w4.multipleJobs) annualWage += STEP2_ADJUSTMENT[w4.filingStatus];
  annualWage += w4.otherIncome;
  annualWage -= w4.extraDeductions;
  annualWage = Math.max(annualWage, 0);

  // Step 2 — Tentative annual withholding from brackets
  const annualTentative = applyBrackets(annualWage, w4.filingStatus);

  // Step 3 — Convert to per-period and subtract dependent credits
  const perPeriod = annualTentative / periods - w4.dependentsAmount / periods;

  // Step 4 — Add extra per-period withholding
  const result = Math.max(perPeriod + w4.extraWithholding, 0);

  return parseFloat(result.toFixed(2));
}

/**
 * Compute per-period FICA taxes (Social Security + Medicare).
 */
export function computeFica(periodWage: number, frequency: PayFrequency): FicaResult {
  const periods = PAY_PERIODS[frequency] ?? 12;
  const annualWage = periodWage * periods;

  // Social Security: only up to wage base
  const ssableWage   = Math.min(annualWage, SS_WAGE_BASE_2024);
  const socialSecurity = parseFloat(((ssableWage / periods) * SS_RATE).toFixed(2));
  const medicare       = parseFloat((periodWage * MEDICARE_RATE).toFixed(2));

  return { socialSecurity, medicare };
}

/** Default W-4 used when no elections are on file (single, no adjustments). */
export const DEFAULT_W4: W4Elections = {
  filingStatus:     'single',
  multipleJobs:     false,
  dependentsAmount: 0,
  otherIncome:      0,
  extraDeductions:  0,
  extraWithholding: 0,
  exempt:           false,
};
