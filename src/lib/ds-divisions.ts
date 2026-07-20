import seed from "@/data/ds-divisions-seed.json";

export interface DsDivision {
  slug: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  districtSlug: string;
}

const divisions = seed.divisions as DsDivision[];

export function getDsDivisions(): DsDivision[] {
  return divisions;
}

export function getDsDivisionName(division: DsDivision, locale: string): string {
  if (locale === "si" && division.nameSi) {
    return division.nameSi;
  }
  if (locale === "ta" && division.nameTa) {
    return division.nameTa;
  }
  return division.name;
}

/** Match DS name/slug query → district slug(s) for services filter stub. */
export function matchDsDivisions(query: string): DsDivision[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return divisions.filter((division) => {
    const haystack = [
      division.slug,
      division.name,
      division.nameSi ?? "",
      division.nameTa ?? "",
      division.districtSlug,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function districtSlugsForDsQuery(query: string): string[] {
  return [
    ...new Set(matchDsDivisions(query).map((division) => division.districtSlug)),
  ];
}
