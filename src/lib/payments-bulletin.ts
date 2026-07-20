import paymentsData from "@/data/cbsl-payments-bulletin-seed.json";

export interface PaymentsBulletinRailStats {
  volumeThousand: number;
  valueRsBillion: number;
  members?: number;
  enabledApps?: number;
}

export interface PaymentsBulletinLankaQrStats {
  domesticVolumeThousand: number;
  domesticValueRsMillion: number;
  merchantsRegistered: number;
  globalVolume: number;
  globalValueRsMillion: number;
}

export interface PaymentsBulletinSnapshot {
  sourceId: string;
  sourceName: string;
  period: string;
  periodLabel: string;
  asOf: string;
  periodEnd: string;
  isSeed: boolean;
  cadence: "quarterly";
  bulletinUrl: string;
  indexUrl: string;
  cefts: PaymentsBulletinRailStats;
  justpay: PaymentsBulletinRailStats;
  lankaqr: PaymentsBulletinLankaQrStats;
  note: string;
}

const snapshot = paymentsData as PaymentsBulletinSnapshot;

/**
 * CBSL Payments Bulletin quarterly pulse (CEFTS / JustPay / LANKAQR).
 *
 * Authoritative surface is the English PDF series listed at
 * https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin
 * (e.g. Payments_Bulletin_4Q2025_e.pdf). No public JSON/CSV API.
 * Until an optional PDF canary lands, return the curated seed with quarterly honesty.
 */
export function getPaymentsBulletinSnapshot(): PaymentsBulletinSnapshot {
  return {
    ...snapshot,
    cadence: "quarterly",
    note:
      snapshot.note ||
      "Seed extract from CBSL Payments Bulletin — quarterly PDF, not a live scrape.",
  };
}
