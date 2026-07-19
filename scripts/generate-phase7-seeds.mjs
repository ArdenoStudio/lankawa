#!/usr/bin/env node
/**
 * Generates Phase 7 seed datasets: transport, cost-of-living, environment.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const property = JSON.parse(
  readFileSync(join(root, "src/data/property-seed.json"), "utf8"),
);

const DISTRICT_SLUGS = property.districts.map((d) => d.slug);

const transport = {
  sourceId: "transport_directory_seed",
  sourceName: "Lankawa transport directory (seed)",
  asOf: "2026-07-01",
  busRoutes: [
    {
      id: "bus-1",
      routeNumber: "1",
      name: "Colombo — Kandy",
      nameSi: "කොළඹ — මහනුවර",
      nameTa: "கொழும்பு — கண்டி",
      originDistrict: "colombo",
      destinationDistrict: "kandy",
      viaDistricts: ["gampaha", "kegalle"],
      operator: "SLTB",
      frequency: "Every 15–30 min",
    },
    {
      id: "bus-138",
      routeNumber: "138",
      name: "Colombo — Galle",
      nameSi: "කොළඹ — ගාල්ල",
      nameTa: "கொழும்பு — காலி",
      originDistrict: "colombo",
      destinationDistrict: "galle",
      viaDistricts: ["kalutara", "matara"],
      operator: "SLTB / Private",
      frequency: "Every 20 min",
    },
    {
      id: "bus-48",
      routeNumber: "48",
      name: "Colombo — Jaffna",
      nameSi: "කොළඹ — යාපනය",
      nameTa: "கொழும்பு — யாழ்ப்பாணம்",
      originDistrict: "colombo",
      destinationDistrict: "jaffna",
      viaDistricts: ["kurunegala", "anuradhapura", "vavuniya"],
      operator: "SLTB",
      frequency: "Daily express",
    },
    {
      id: "bus-87",
      routeNumber: "87",
      name: "Colombo — Badulla",
      nameSi: "කොළඹ — බදුල්ල",
      nameTa: "கொழும்பு — பadulla",
      originDistrict: "colombo",
      destinationDistrict: "badulla",
      viaDistricts: ["kegalle", "kandy", "nuwara-eliya"],
      operator: "SLTB",
      frequency: "Hourly",
    },
    {
      id: "bus-245",
      routeNumber: "245",
      name: "Colombo — Trincomalee",
      nameSi: "කොළඹ — ත්‍රිකුණාමලය",
      nameTa: "கொழும்பு — திருகோணமலை",
      originDistrict: "colombo",
      destinationDistrict: "trincomalee",
      viaDistricts: ["kurunegala", "anuradhapura", "polonnaruwa"],
      operator: "SLTB",
      frequency: "Daily",
    },
    {
      id: "bus-602",
      routeNumber: "602",
      name: "Kandy — Nuwara Eliya",
      nameSi: "මහනුවර — නuwara Eliya",
      nameTa: "கண்டி — நுவரெலியா",
      originDistrict: "kandy",
      destinationDistrict: "nuwara-eliya",
      viaDistricts: ["matale"],
      operator: "Private",
      frequency: "Every 30 min",
    },
    {
      id: "bus-350",
      routeNumber: "350",
      name: "Galle — Hambantota",
      nameSi: "ගාල්ල — හම්බන්තොට",
      nameTa: "காலி — அம்பாantota",
      originDistrict: "galle",
      destinationDistrict: "hambantota",
      viaDistricts: ["matara"],
      operator: "SLTB",
      frequency: "Hourly",
    },
    {
      id: "bus-770",
      routeNumber: "770",
      name: "Kurunegala — Anuradhapura",
      nameSi: "කurunegala — අනuradhapura",
      nameTa: "கurunegala — அனuradhapura",
      originDistrict: "kurunegala",
      destinationDistrict: "anuradhapura",
      viaDistricts: ["puttalam"],
      operator: "SLTB",
      frequency: "Every 45 min",
    },
  ],
  railwayStations: [
    { id: "fort", name: "Colombo Fort", nameSi: "කොළඹ කොටුව", nameTa: "கொழும்பு Fort", districtSlug: "colombo", line: "Main Line", lat: 6.9344, lng: 79.8428, isMajor: true },
    { id: "maradana", name: "Maradana", districtSlug: "colombo", line: "Coastal Line", lat: 6.9297, lng: 79.8597, isMajor: true },
    { id: "kandy", name: "Kandy", nameSi: "මහනුවර", nameTa: "கண்டி", districtSlug: "kandy", line: "Main Line", lat: 7.2906, lng: 80.6337, isMajor: true },
    { id: "galle", name: "Galle", nameSi: "ගාල්ල", nameTa: "காலி", districtSlug: "galle", line: "Coastal Line", lat: 6.0329, lng: 80.217, isMajor: true },
    { id: "matara", name: "Matara", districtSlug: "matara", line: "Coastal Line", lat: 5.9485, lng: 80.5353, isMajor: true },
    { id: "badulla", name: "Badulla", districtSlug: "badulla", line: "Main Line", lat: 6.9934, lng: 81.055, isMajor: true },
    { id: "anuradhapura", name: "Anuradhapura", districtSlug: "anuradhapura", line: "Northern Line", lat: 8.3114, lng: 80.4037, isMajor: true },
    { id: "jaffna", name: "Jaffna", districtSlug: "jaffna", line: "Northern Line", lat: 9.6615, lng: 80.0255, isMajor: true },
    { id: "trincomalee", name: "Trincomalee", districtSlug: "trincomalee", line: "Trincomalee Line", lat: 8.5874, lng: 81.2152, isMajor: true },
    { id: "batticaloa", name: "Batticaloa", districtSlug: "batticaloa", line: "Batticaloa Line", lat: 7.7102, lng: 81.6924, isMajor: true },
    { id: "polgahawela", name: "Polgahawela", districtSlug: "kurunegala", line: "Main Line", lat: 7.335, lng: 80.297, isMajor: false },
    { id: "ratnapura", name: "Ratnapura", districtSlug: "ratnapura", line: "Ratnapura Line", lat: 6.6828, lng: 80.3992, isMajor: false },
    { id: "nuwara-eliya", name: "Nanu Oya", nameSi: "නanu Oya", nameTa: "Nanu Oya", districtSlug: "nuwara-eliya", line: "Main Line", lat: 6.9497, lng: 80.7892, isMajor: false },
  ],
  airports: [
    { id: "bia", name: "Bandaranaike International Airport", nameSi: "බandaranaayake අantararaashtreeya vimana", nameTa: "Bandaranaike சarbbaraashtreeya vimana", districtSlug: "gampaha", iata: "CMB", lat: 7.1808, lng: 79.8841, isInternational: true },
    { id: "mria", name: "Mattala Rajapaksa International Airport", districtSlug: "hambantota", iata: "HRI", lat: 6.2845, lng: 81.1241, isInternational: true },
    { id: "jaf", name: "Jaffna International Airport", districtSlug: "jaffna", iata: "JAF", lat: 9.7923, lng: 80.0701, isInternational: true },
    { id: "btc", name: "Batticaloa Airport", districtSlug: "batticaloa", iata: "BTC", lat: 7.7058, lng: 81.6788, isInternational: false },
  ],
};

const FUEL_PETROL = 363;
const maxProperty = Math.max(...property.districts.map((d) => d.medianPerPerch));

const colIndices = property.districts.map((district) => {
  const propertyNorm = (district.medianPerPerch / maxProperty) * 100;
  const foodBasket = Math.round(42000 + propertyNorm * 280);
  const fuelComponent = 100;
  const index = Math.round(
    propertyNorm * 0.45 + fuelComponent * 0.2 + (foodBasket / 700) * 0.35,
  );
  return {
    slug: district.slug,
    index,
    fuelComponent,
    propertyComponent: Math.round(propertyNorm),
    foodBasketLkr: foodBasket,
    rank: 0,
  };
});

colIndices.sort((a, b) => b.index - a.index);
colIndices.forEach((row, i) => {
  row.rank = i + 1;
});

const nationalIndex = Math.round(
  colIndices.reduce((sum, row) => sum + row.index, 0) / colIndices.length,
);

const costOfLiving = {
  sourceId: "cost_of_living_seed",
  sourceName: "Lankawa cost of living index (seed)",
  asOf: "2026-07-01",
  nationalIndex,
  fuelPricePetrol92: FUEL_PETROL,
  districts: colIndices,
};

const AQI_BY_DENSITY = {
  colombo: { aqi: 78, band: "moderate", pm25: 24 },
  gampaha: { aqi: 65, band: "moderate", pm25: 19 },
  kalutara: { aqi: 52, band: "moderate", pm25: 14 },
  kandy: { aqi: 48, band: "good", pm25: 12 },
  matale: { aqi: 42, band: "good", pm25: 10 },
  "nuwara-eliya": { aqi: 28, band: "good", pm25: 6 },
  galle: { aqi: 44, band: "good", pm25: 11 },
  matara: { aqi: 40, band: "good", pm25: 10 },
  hambantota: { aqi: 36, band: "good", pm25: 9 },
  jaffna: { aqi: 55, band: "moderate", pm25: 16 },
  kilinochchi: { aqi: 32, band: "good", pm25: 8 },
  mannar: { aqi: 30, band: "good", pm25: 7 },
  vavuniya: { aqi: 38, band: "good", pm25: 9 },
  mullaitivu: { aqi: 26, band: "good", pm25: 6 },
  batticaloa: { aqi: 46, band: "good", pm25: 11 },
  ampara: { aqi: 41, band: "good", pm25: 10 },
  trincomalee: { aqi: 43, band: "good", pm25: 10 },
  kurunegala: { aqi: 50, band: "moderate", pm25: 13 },
  puttalam: { aqi: 45, band: "good", pm25: 11 },
  anuradhapura: { aqi: 39, band: "good", pm25: 9 },
  polonnaruwa: { aqi: 37, band: "good", pm25: 9 },
  badulla: { aqi: 34, band: "good", pm25: 8 },
  monaragala: { aqi: 33, band: "good", pm25: 8 },
  ratnapura: { aqi: 47, band: "good", pm25: 11 },
  kegalle: { aqi: 49, band: "good", pm25: 12 },
};

const environment = {
  sourceId: "environment_aqi_seed",
  sourceName: "Lankawa air quality index (seed — IQAir-style representative)",
  asOf: "2026-07-01",
  districts: DISTRICT_SLUGS.map((slug) => {
    const stat = AQI_BY_DENSITY[slug] ?? { aqi: 40, band: "good", pm25: 10 };
    return { slug, ...stat };
  }),
};

writeFileSync(
  join(root, "src/data/transport-seed.json"),
  `${JSON.stringify(transport, null, 2)}\n`,
);
writeFileSync(
  join(root, "src/data/cost-of-living-seed.json"),
  `${JSON.stringify(costOfLiving, null, 2)}\n`,
);
writeFileSync(
  join(root, "src/data/environment-seed.json"),
  `${JSON.stringify(environment, null, 2)}\n`,
);

console.log("Generated transport, cost-of-living, and environment seeds");
