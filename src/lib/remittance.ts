import {
  fetchRemittanceTtSnapshot,
  type RemittanceBankQuote,
  type RemittanceTtSnapshot,
} from "@/lib/integrations/remittance-banks";

export type { RemittanceBankQuote, RemittanceTtSnapshot };

export async function getRemittanceTtSnapshot(): Promise<RemittanceTtSnapshot> {
  return fetchRemittanceTtSnapshot();
}
