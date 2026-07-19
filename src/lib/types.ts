export type FreshnessTier = "fresh" | "stale" | "down" | "unknown";

export type SourceCategory =
  | "economy"
  | "disaster"
  | "energy"
  | "environment"
  | "health"
  | "civic"
  | "transport";

export interface SourceDefinition {
  id: string;
  name: string;
  category: SourceCategory;
  /** Server-side fetch endpoint — never exposed as a clickable UI link. */
  url: string;
  cadenceMinutes: number;
  adapter: "api" | "scrape" | "partner";
  description: string;
  methodology: string;
  metrics: string[];
}

export interface SourceHealth {
  id: string;
  name: string;
  category: SourceCategory;
  tier: FreshnessTier;
  lastSuccessAt: string | null;
  lastCheckedAt: string;
  error: string | null;
  /** Internal provenance path, e.g. /sources/cbsl_fx */
  provenancePath: string;
}

export interface PulseMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  observedAt: string | null;
  tier: FreshnessTier;
  sourceId: string;
  /** Internal provenance path, e.g. /sources/cbsl_fx */
  provenancePath: string;
  note?: string;
}

export interface District {
  slug: string;
  name: string;
  nameSi: string;
  nameTa: string;
  province: string;
  capital: string;
  population: number;
  areaSqKm: number;
}

export interface FloodAlertSummary {
  alertLevel: string;
  count: number;
  stations: string[];
}

export interface PulseSnapshot {
  generatedAt: string;
  metrics: PulseMetric[];
  flood: FloodAlertSummary[];
  sources: SourceHealth[];
}

export type ElectionCandidateId =
  | "akd"
  | "premadasa"
  | "wickremesinghe"
  | "others";

export interface ElectionCandidate {
  id: ElectionCandidateId;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  finalPercentage?: number;
}

export interface ElectionDistrictResult {
  slug: string;
  winner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  results: Record<ElectionCandidateId, number>;
  electoralDistrict?: string;
  note?: string;
}

export interface PresidentialElection {
  id: string;
  type: "presidential";
  date: string;
  sourceId: string;
  sourceName: string;
  nationalWinner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  candidates: ElectionCandidate[];
  districts: ElectionDistrictResult[];
}

export type ParliamentaryPartyId =
  | "npp"
  | "sjb"
  | "itak"
  | "ndf"
  | "slpp"
  | "others";

export interface ParliamentaryParty {
  id: ParliamentaryPartyId;
  name: string;
  abbreviation: string;
  districtSeats: number;
  nationalListSeats: number;
  totalSeats: number;
  votes: number;
  percentage: number;
}

export interface ParliamentaryDistrictResult {
  slug: string;
  name: string;
  province: string;
  districtSlugs: string[];
  totalSeats: number;
  turnout: number;
  winner: ParliamentaryPartyId;
  seats: Record<ParliamentaryPartyId, number>;
  votes: Record<ParliamentaryPartyId, number>;
}

export interface ParliamentaryElection {
  id: string;
  type: "parliamentary";
  date: string;
  sourceId: string;
  sourceName: string;
  totalSeats: number;
  districtSeats: number;
  nationalListSeats: number;
  nationalWinner: ParliamentaryPartyId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  parties: ParliamentaryParty[];
  districts: ParliamentaryDistrictResult[];
}

export interface FloodStationLevel {
  stationName: string;
  riverName: string;
  waterLevel: number;
  alertStatus: string;
  remarks: string;
  timestamp: string;
}

export type PublicServiceType =
  | "hospital"
  | "school"
  | "gn_office"
  | "police_station"
  | "moh_office"
  | "divisional_hospital";

export interface PublicServiceFacility {
  id: string;
  type: PublicServiceType;
  name: string;
  nameSi?: string;
  nameTa?: string;
  districtSlug: string;
  address: string;
}

export interface EconomyMacroIndicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  period: string;
}

export interface FxSeriesPoint {
  date: string;
  sellRate: number;
}

export interface EconomyMacroSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  indicators: EconomyMacroIndicator[];
  fxSeries: FxSeriesPoint[];
}

export interface BudgetSector {
  id: string;
  amount: number;
  sharePct: number;
}

export interface BudgetMinistry {
  id: string;
  sector: string;
  amount: number;
}

export interface BudgetFiscalYear {
  id: string;
  label: string;
  revenue: number;
  expenditure: number;
  deficit: number;
  capitalExpenditure: number;
  recurrentExpenditure: number;
  sectors: BudgetSector[];
  ministries: BudgetMinistry[];
}

export interface BudgetSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  currency: string;
  fiscalYears: BudgetFiscalYear[];
}

export type DengueRiskLevel = "high" | "moderate" | "low";

export interface DengueDistrictStat {
  slug: string;
  cases: number;
  changePct: number;
  riskLevel: DengueRiskLevel;
}

export interface DengueSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  epidemiologicalWeek: number;
  year: number;
  nationalTotal: number;
  nationalChangePct: number;
  districts: DengueDistrictStat[];
}

export interface MpScorecardMember {
  id: string;
  slug: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  electoralDistrict: string;
  party: string;
  attendancePct: number;
  privateMemberBills: number;
  questionsAsked: number;
  committeeRoles: number;
}

export type TransportMode = "bus" | "rail" | "air";

export interface BusRoute {
  id: string;
  routeNumber: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  originDistrict: string;
  destinationDistrict: string;
  viaDistricts: string[];
  operator: string;
  frequency: string;
}

export interface RailwayStation {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  districtSlug: string;
  line: string;
  lat: number;
  lng: number;
  isMajor: boolean;
}

export interface Airport {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  districtSlug: string;
  iata: string;
  lat: number;
  lng: number;
  isInternational: boolean;
}

export interface TransportCatalog {
  sourceId: string;
  sourceName: string;
  asOf: string;
  busRoutes: BusRoute[];
  railwayStations: RailwayStation[];
  airports: Airport[];
}

export interface CostOfLivingDistrict {
  slug: string;
  index: number;
  fuelComponent: number;
  propertyComponent: number;
  foodBasketLkr: number;
  rank: number;
}

export interface CostOfLivingSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  nationalIndex: number;
  fuelPricePetrol92: number;
  districts: CostOfLivingDistrict[];
}

export type AqiBand = "good" | "moderate" | "unhealthy_sensitive" | "unhealthy" | "very_unhealthy";

export interface EnvironmentDistrictStat {
  slug: string;
  aqi: number;
  band: AqiBand;
  pm25: number;
}

export interface EnvironmentSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  districts: EnvironmentDistrictStat[];
}

export interface MpScorecardSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  parliamentSession: string;
  members: MpScorecardMember[];
}

export type TenderCategory = "goods" | "works" | "services";
export type TenderStatus = "open" | "closing_soon" | "closed";

export interface TenderNotice {
  id: string;
  title: string;
  reference: string;
  ministry: string;
  province: string;
  district: string;
  category: TenderCategory;
  estimatedValueLkr: number;
  closingDate: string;
  status: TenderStatus;
}

export interface PropertyDistrictPrice {
  slug: string;
  medianPerPerch: number;
  lowBand: number;
  highBand: number;
  medianPerSqFt: number;
  trendPct: number;
}

export interface PropertySnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  unit: "perch" | "sqft";
  currency: string;
  districts: PropertyDistrictPrice[];
}

export interface VehicleMakeStat {
  make: string;
  count: number;
}

export interface VehicleDistrictPrice {
  slug: string;
  districtName: string;
  listingCount: number;
  medianPriceLkr: number;
  avgPriceLkr: number;
  topMake: string;
  topModel: string;
}

export interface VehicleSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  totalListings: number;
  avgPriceLkr: number;
  goodDealsCount: number;
  sourceCount: number;
  popularMakes: VehicleMakeStat[];
  districts: VehicleDistrictPrice[];
}

export interface FoodItemPrice {
  slug: string;
  name: string;
  unit: string;
  priceLkr: number;
  source: string;
}

export interface FoodDistrictMealCost {
  slug: string;
  dailyMealCostLkr: number;
  monthlyBasketLkr: number;
  restaurantIndex: number;
}

export interface FoodSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  essentialsBasketLkr: number;
  retailOffers: number;
  marketQuotes: number;
  stapleItems: FoodItemPrice[];
  districts: FoodDistrictMealCost[];
}

export interface LifeDomainMetric {
  label: string;
  value: number;
  unit: string;
}

export interface LifeDomainHighlight {
  label: string;
  value: string;
  severity: string;
}

export interface LifeDomain {
  key: string;
  label: string;
  category: string;
  status: string;
  summary: string;
  observedAt: string;
  freshnessNote?: string;
  metrics: LifeDomainMetric[];
  highlights?: LifeDomainHighlight[];
}

export interface LifeOverviewSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  headline: string;
  freshnessNote: string;
  domains: LifeDomain[];
}

export interface ArdenoModuleCard {
  id: string;
  title: string;
  description: string;
  href: string;
  sourceId: string;
  metricLabel?: string;
  metricValue?: string;
  status?: string;
}

export type LocalGovernmentType = "MC" | "UC" | "PS";

export interface LocalGovernmentBody {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  type: LocalGovernmentType;
  districtSlug: string;
  province: string;
}

export interface LocalGovernmentCatalog {
  sourceId: string;
  sourceName: string;
  asOf: string;
  totalCount: number;
  bodies: LocalGovernmentBody[];
}

export interface HistoricalPresidentialCycle {
  id: string;
  type: "presidential";
  year: number;
  date: string;
  label: string;
  sourceId: string;
  sourceName: string;
  nationalWinner: string;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    votes: number;
    percentage: number;
    finalPercentage?: number;
  }>;
  districts: Array<{
    slug: string;
    winner: string;
    turnout: number;
    validVotes: number;
    results: Record<string, number>;
    electoralDistrict?: string;
    note?: string;
  }>;
}

export interface ParliamentaryHistoryCycle {
  year: number;
  date: string;
  winner: string | null;
  winnerSeats: number | null;
  totalSeats: number;
  turnout: number | null;
  sourceId: string;
  note?: string;
}
