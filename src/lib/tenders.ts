import tendersData from "@/data/tenders-seed.json";
import { fetchLiveTenders } from "./integrations/tenders";
import type { TenderNotice, TenderSnapshot, TenderStatus } from "./types";

const snapshot = tendersData as TenderSnapshot;

export function getTendersSnapshot(): TenderSnapshot {
  return snapshot;
}

export async function getTendersData(): Promise<TenderSnapshot> {
  return (await fetchLiveTenders()) ?? snapshot;
}

export function getAllTenders(): TenderNotice[] {
  return snapshot.notices;
}

export function filterTenderNotices(
  notices: TenderNotice[],
  options: {
    q?: string;
    district?: string;
    province?: string;
    category?: string;
    status?: TenderStatus;
  },
): TenderNotice[] {
  const normalizedQuery = options.q?.trim().toLowerCase() ?? "";

  return notices.filter((notice) => {
    if (options.district && notice.district !== options.district) {
      return false;
    }
    if (options.province && notice.province !== options.province) {
      return false;
    }
    if (options.category && notice.category !== options.category) {
      return false;
    }
    if (options.status && notice.status !== options.status) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = [
        notice.title,
        notice.reference,
        notice.ministry,
        notice.district,
        notice.province,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}

export function filterTenders(options: {
  q?: string;
  district?: string;
  province?: string;
  category?: string;
  status?: TenderStatus;
}): TenderNotice[] {
  return filterTenderNotices(snapshot.notices, options);
}
