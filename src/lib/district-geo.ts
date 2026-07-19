const DISTRICT_PCODE_TO_SLUG: Record<string, string> = {
  LK11: "colombo",
  LK12: "gampaha",
  LK13: "kalutara",
  LK21: "kandy",
  LK22: "matale",
  LK23: "nuwara-eliya",
  LK31: "galle",
  LK32: "matara",
  LK33: "hambantota",
  LK41: "jaffna",
  LK42: "mannar",
  LK43: "vavuniya",
  LK44: "mullaitivu",
  LK45: "kilinochchi",
  LK51: "batticaloa",
  LK52: "ampara",
  LK53: "trincomalee",
  LK61: "kurunegala",
  LK62: "puttalam",
  LK71: "anuradhapura",
  LK72: "polonnaruwa",
  LK81: "badulla",
  LK82: "monaragala",
  LK91: "ratnapura",
  LK92: "kegalle",
};

export function districtSlugFromPcode(pcode: string | undefined): string | null {
  if (!pcode) {
    return null;
  }
  return DISTRICT_PCODE_TO_SLUG[pcode] ?? null;
}

export function districtSlugFromName(name: string | undefined): string | null {
  if (!name || name.startsWith("[")) {
    return null;
  }
  return name.toLowerCase().replace(/\s+/g, "-");
}
