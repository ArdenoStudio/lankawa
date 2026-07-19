import type { District } from "./types";

export const DISTRICTS: District[] = [
  { slug: "colombo", name: "Colombo", nameSi: "කොළඹ", nameTa: "கொழும்பு", province: "Western", capital: "Colombo", population: 2_324_135, areaSqKm: 699 },
  { slug: "gampaha", name: "Gampaha", nameSi: "ගම්පහ", nameTa: "கம்பஹா", province: "Western", capital: "Gampaha", population: 2_304_833, areaSqKm: 1_387 },
  { slug: "kalutara", name: "Kalutara", nameSi: "කළුතර", nameTa: "களுத்துறை", province: "Western", capital: "Kalutara", population: 1_217_432, areaSqKm: 1_598 },
  { slug: "kandy", name: "Kandy", nameSi: "මහනුවර", nameTa: "கண்டி", province: "Central", capital: "Kandy", population: 1_375_382, areaSqKm: 1_940 },
  { slug: "matale", name: "Matale", nameSi: "මාතලේ", nameTa: "மாத்தளை", province: "Central", capital: "Matale", population: 484_531, areaSqKm: 1_993 },
  { slug: "nuwara-eliya", name: "Nuwara Eliya", nameSi: "නුවර එළිය", nameTa: "நுவரெலியா", province: "Central", capital: "Nuwara Eliya", population: 711_644, areaSqKm: 1_741 },
  { slug: "galle", name: "Galle", nameSi: "ගාල්ල", nameTa: "காலி", province: "Southern", capital: "Galle", population: 1_063_334, areaSqKm: 1_652 },
  { slug: "matara", name: "Matara", nameSi: "මාතර", nameTa: "மாத்தறை", province: "Southern", capital: "Matara", population: 814_048, areaSqKm: 1_283 },
  { slug: "hambantota", name: "Hambantota", nameSi: "හම්බන්තොට", nameTa: "அம்பாந்தோட்டை", province: "Southern", capital: "Hambantota", population: 599_617, areaSqKm: 2_609 },
  { slug: "jaffna", name: "Jaffna", nameSi: "යාපනය", nameTa: "யாழ்ப்பாணம்", province: "Northern", capital: "Jaffna", population: 583_882, areaSqKm: 1_025 },
  { slug: "kilinochchi", name: "Kilinochchi", nameSi: "කිලිනොච්චි", nameTa: "கிளிநொச்சி", province: "Northern", capital: "Kilinochchi", population: 112_875, areaSqKm: 1_279 },
  { slug: "mannar", name: "Mannar", nameSi: "මන්නාරම", nameTa: "மன்னார்", province: "Northern", capital: "Mannar", population: 99_051, areaSqKm: 1_996 },
  { slug: "vavuniya", name: "Vavuniya", nameSi: "වවුනියාව", nameTa: "வவுனியா", province: "Northern", capital: "Vavuniya", population: 167_420, areaSqKm: 1_967 },
  { slug: "mullaitivu", name: "Mullaitivu", nameSi: "මුලතිව්", nameTa: "முல்லைத்தீவு", province: "Northern", capital: "Mullaitivu", population: 91_947, areaSqKm: 2_617 },
  { slug: "batticaloa", name: "Batticaloa", nameSi: "මඩකලපුව", nameTa: "மட்டக்களப்பு", province: "Eastern", capital: "Batticaloa", population: 526_567, areaSqKm: 2_854 },
  { slug: "ampara", name: "Ampara", nameSi: "අම්පාර", nameTa: "அம்பாறை", province: "Eastern", capital: "Ampara", population: 649_402, areaSqKm: 4_415 },
  { slug: "trincomalee", name: "Trincomalee", nameSi: "ත්‍රිකුණාමලය", nameTa: "திருகோணமலை", province: "Eastern", capital: "Trincomalee", population: 379_541, areaSqKm: 2_727 },
  { slug: "kurunegala", name: "Kurunegala", nameSi: "කුරුණෑගල", nameTa: "குருணாகல்", province: "North Western", capital: "Kurunegala", population: 1_618_465, areaSqKm: 4_816 },
  { slug: "puttalam", name: "Puttalam", nameSi: "පුත්තලම", nameTa: "புத்தளம்", province: "North Western", capital: "Puttalam", population: 762_396, areaSqKm: 3_072 },
  { slug: "anuradhapura", name: "Anuradhapura", nameSi: "අනුරාධපුරය", nameTa: "அனுராதபுரம்", province: "North Central", capital: "Anuradhapura", population: 856_500, areaSqKm: 7_179 },
  { slug: "polonnaruwa", name: "Polonnaruwa", nameSi: "පොළොන්නරුව", nameTa: "பொலன்னறுவை", province: "North Central", capital: "Polonnaruwa", population: 406_088, areaSqKm: 3_293 },
  { slug: "badulla", name: "Badulla", nameSi: "බදුල්ල", nameTa: "பதுளை", province: "Uva", capital: "Badulla", population: 815_405, areaSqKm: 2_861 },
  { slug: "monaragala", name: "Monaragala", nameSi: "මොණරාගල", nameTa: "மொனராகலை", province: "Uva", capital: "Monaragala", population: 451_058, areaSqKm: 5_639 },
  { slug: "ratnapura", name: "Ratnapura", nameSi: "රත්නපුර", nameTa: "இரத்தினபுரி", province: "Sabaragamuwa", capital: "Ratnapura", population: 1_088_007, areaSqKm: 3_275 },
  { slug: "kegalle", name: "Kegalle", nameSi: "කෑගල්ල", nameTa: "கேகாலை", province: "Sabaragamuwa", capital: "Kegalle", population: 840_648, areaSqKm: 1_693 },
];

export function getDistrict(slug: string): District | undefined {
  return DISTRICTS.find((district) => district.slug === slug);
}

export function getDistrictName(district: District, locale: string): string {
  if (locale === "si") {
    return district.nameSi;
  }
  if (locale === "ta") {
    return district.nameTa;
  }
  return district.name;
}
