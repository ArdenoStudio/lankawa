/**
 * Sri Lanka National Identity Card (NIC) Decoder
 *
 * Supports both legacy 9-digit (pre-2016) and new 12-digit NIC formats.
 *
 * Legacy (9+V/X): First 2 digits = year (19xx), next 3 = day-of-year (female +500),
 *                  next 3 = sequential, last char = V (voter) or X (non-voter).
 * New 12-digit:   First 4 digits = year, next 3 = day-of-year (female +500),
 *                  next 4 = sequential, last digit = check digit.
 *
 * Reference: https://en.wikipedia.org/wiki/National_identity_card_(Sri_Lanka)
 */

export type NicFormat = "legacy" | "new" | "invalid";

export interface NicDecodeResult {
  raw: string;
  format: NicFormat;
  valid: boolean;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthDate: string | null; // ISO YYYY-MM-DD
  gender: "male" | "female" | null;
  serialNumber: string | null;
  votingEligibility: "eligible" | "non-eligible" | null; // legacy only, null for new format
  ageYears: number | null;
  errors: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert day-of-year to {month (1-indexed), day} for a given year. */
function dayOfYearToDate(
  year: number,
  dayOfYear: number,
): { month: number; day: number } | null {
  if (dayOfYear < 1 || dayOfYear > 366) return null;
  const d = new Date(year, 0, dayOfYear); // Jan 0-indexed → adds dayOfYear days
  if (isNaN(d.getTime())) return null;
  return { month: d.getMonth() + 1, day: d.getDate() };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ─── Legacy Decoder (9-char + V/X) ───────────────────────────────────────────

function decodeLegacy(nic: string): NicDecodeResult {
  const upper = nic.toUpperCase();
  const errors: string[] = [];

  // Validate pattern: 9 digits + V or X
  if (!/^\d{9}[VX]$/.test(upper)) {
    return {
      raw: nic,
      format: "legacy",
      valid: false,
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      birthDate: null,
      gender: null,
      serialNumber: null,
      votingEligibility: null,
      ageYears: null,
      errors: ["Invalid legacy NIC format. Expected 9 digits followed by V or X."],
    };
  }

  const yearPart = parseInt(upper.slice(0, 2), 10);
  const dayPart = parseInt(upper.slice(2, 5), 10);
  const serial = upper.slice(5, 8);
  const suffix = upper.charAt(9) as "V" | "X";

  const birthYear = 1900 + yearPart;

  // Gender encoding: female adds 500 to day-of-year
  const isFemale = dayPart > 500;
  const actualDayOfYear = isFemale ? dayPart - 500 : dayPart;
  const gender: "male" | "female" = isFemale ? "female" : "male";

  const dateComponents = dayOfYearToDate(birthYear, actualDayOfYear);
  if (!dateComponents) {
    errors.push(`Invalid day-of-year ${actualDayOfYear} for year ${birthYear}.`);
  }

  const birthMonth = dateComponents?.month ?? null;
  const birthDay = dateComponents?.day ?? null;
  const birthDate =
    birthMonth && birthDay
      ? `${birthYear}-${pad2(birthMonth)}-${pad2(birthDay)}`
      : null;

  const ageYears =
    birthDate
      ? Math.floor(
          (Date.now() - new Date(birthDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

  return {
    raw: nic,
    format: "legacy",
    valid: errors.length === 0,
    birthYear,
    birthMonth,
    birthDay,
    birthDate,
    gender,
    serialNumber: serial,
    votingEligibility: suffix === "V" ? "eligible" : "non-eligible",
    ageYears,
    errors,
  };
}

// ─── New 12-digit Decoder ─────────────────────────────────────────────────────

function decodeNew(nic: string): NicDecodeResult {
  const errors: string[] = [];

  if (!/^\d{12}$/.test(nic)) {
    return {
      raw: nic,
      format: "new",
      valid: false,
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      birthDate: null,
      gender: null,
      serialNumber: null,
      votingEligibility: null,
      ageYears: null,
      errors: ["Invalid new NIC format. Expected exactly 12 digits."],
    };
  }

  const birthYear = parseInt(nic.slice(0, 4), 10);
  const dayPart = parseInt(nic.slice(4, 7), 10);
  const serial = nic.slice(7, 11);

  if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
    errors.push(`Unreasonable birth year ${birthYear}.`);
  }

  const isFemale = dayPart > 500;
  const actualDayOfYear = isFemale ? dayPart - 500 : dayPart;
  const gender: "male" | "female" = isFemale ? "female" : "male";

  const dateComponents = dayOfYearToDate(birthYear, actualDayOfYear);
  if (!dateComponents) {
    errors.push(`Invalid day-of-year ${actualDayOfYear} for year ${birthYear}.`);
  }

  const birthMonth = dateComponents?.month ?? null;
  const birthDay = dateComponents?.day ?? null;
  const birthDate =
    birthMonth && birthDay
      ? `${birthYear}-${pad2(birthMonth)}-${pad2(birthDay)}`
      : null;

  const ageYears =
    birthDate
      ? Math.floor(
          (Date.now() - new Date(birthDate).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25),
        )
      : null;

  return {
    raw: nic,
    format: "new",
    valid: errors.length === 0,
    birthYear,
    birthMonth,
    birthDay,
    birthDate,
    gender,
    serialNumber: serial,
    votingEligibility: null, // new format does not encode voting status
    ageYears,
    errors,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Decodes a Sri Lanka NIC number.
 *
 * @param nic - Raw NIC string (9+V/X legacy or 12-digit new)
 * @returns Decoded NicDecodeResult with birthdate, gender, and eligibility.
 */
export function decodeNIC(nic: string): NicDecodeResult {
  if (!nic || typeof nic !== "string") {
    return {
      raw: nic ?? "",
      format: "invalid",
      valid: false,
      birthYear: null,
      birthMonth: null,
      birthDay: null,
      birthDate: null,
      gender: null,
      serialNumber: null,
      votingEligibility: null,
      ageYears: null,
      errors: ["NIC must be a non-empty string."],
    };
  }

  const normalized = nic.trim().toUpperCase();

  // Detect format
  if (/^\d{9}[VX]$/i.test(normalized)) {
    return decodeLegacy(normalized);
  }

  if (/^\d{12}$/.test(normalized)) {
    return decodeNew(normalized);
  }

  return {
    raw: nic,
    format: "invalid",
    valid: false,
    birthYear: null,
    birthMonth: null,
    birthDay: null,
    birthDate: null,
    gender: null,
    serialNumber: null,
    votingEligibility: null,
    ageYears: null,
    errors: [
      `Unrecognised NIC format. Got "${nic}". Expected 9 digits + V/X (legacy) or 12 digits (new).`,
    ],
  };
}

/**
 * Returns true if the given NIC decodes to a valid result.
 */
export function isValidNIC(nic: string): boolean {
  return decodeNIC(nic).valid;
}

/**
 * Returns a human-readable summary of the NIC.
 */
export function formatNICSummary(nic: string): string {
  const r = decodeNIC(nic);
  if (!r.valid) return `Invalid NIC: ${r.errors.join("; ")}`;

  const parts: string[] = [];
  parts.push(`Format: ${r.format === "legacy" ? "Legacy (9+V/X)" : "New (12-digit)"}`);
  if (r.birthDate) parts.push(`DOB: ${r.birthDate}`);
  if (r.gender) parts.push(`Gender: ${r.gender}`);
  if (r.ageYears !== null) parts.push(`Age: ~${r.ageYears} years`);
  if (r.votingEligibility) parts.push(`Voting: ${r.votingEligibility}`);
  return parts.join(" | ");
}
