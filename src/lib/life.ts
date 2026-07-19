import type { ArdenoModuleCard, LifeOverviewSnapshot } from "./types";

export function getLifeOverviewSeed(): LifeOverviewSnapshot {
  return {
    sourceId: "life_platform_seed",
    sourceName: "Ariva Life Platform (seed)",
    asOf: "2026-07-19T00:00:00.000Z",
    headline:
      "Living cost signals across food, fuel, property, and vehicles — aggregated for Sri Lanka.",
    freshnessNote:
      "Seed overview used when the Life Platform API is unavailable. Domain pages use their own live adapters with seed fallbacks.",
    domains: [
      {
        key: "food",
        label: "FoodLK",
        category: "Food and groceries",
        status: "seed",
        summary: "Staple prices and district meal-cost bands.",
        observedAt: "2026-07-19T00:00:00.000Z",
        metrics: [
          { label: "Essentials basket", value: 8650, unit: "LKR" },
          { label: "Retail offers", value: 240, unit: "offers" },
        ],
      },
      {
        key: "fuel",
        label: "Octane",
        category: "Fuel prices",
        status: "seed",
        summary: "CPC petrol and diesel reference prices.",
        observedAt: "2026-06-30T00:00:00.000Z",
        metrics: [
          { label: "Petrol 92", value: 414, unit: "LKR/L" },
          { label: "Auto Diesel", value: 382, unit: "LKR/L" },
        ],
      },
      {
        key: "property",
        label: "PropertyLK",
        category: "Property prices",
        status: "seed",
        summary: "District median land price bands.",
        observedAt: "2026-07-01T00:00:00.000Z",
        metrics: [
          { label: "Districts covered", value: 25, unit: "districts" },
        ],
      },
      {
        key: "vehicle",
        label: "AutoLens LK",
        category: "Vehicle market",
        status: "seed",
        summary: "Used vehicle listing medians by district.",
        observedAt: "2026-06-16T06:20:08.166342Z",
        metrics: [
          { label: "Listings", value: 112609, unit: "listings" },
          { label: "Average price", value: 9409013, unit: "LKR" },
        ],
      },
    ],
  };
}

export function buildArdenoModuleCards(
  overview: LifeOverviewSnapshot,
): ArdenoModuleCard[] {
  const domainMap = new Map(overview.domains.map((domain) => [domain.key, domain]));

  const cards: ArdenoModuleCard[] = [
    {
      id: "fuel",
      title: "Octane Fuel",
      description: "CPC petrol and diesel prices with weekly history.",
      href: "/economy",
      sourceId: "octane_fuel",
      metricLabel: domainMap.get("fuel")?.metrics[0]?.label,
      metricValue: domainMap.get("fuel")?.metrics[0]
        ? `${domainMap.get("fuel")!.metrics[0].value} ${domainMap.get("fuel")!.metrics[0].unit}`
        : undefined,
      status: domainMap.get("fuel")?.status,
    },
    {
      id: "property",
      title: "PropertyLK",
      description: "District median land price bands and choropleth map.",
      href: "/property",
      sourceId: "propertylk_seed",
      metricLabel: "Districts",
      metricValue: "25 covered",
      status: domainMap.get("property")?.status,
    },
    {
      id: "vehicles",
      title: "AutoLens LK",
      description: "Used vehicle market medians, popular makes, and district bands.",
      href: "/vehicles",
      sourceId: "vehicle_platform_seed",
      metricLabel: domainMap.get("vehicle")?.metrics[0]?.label,
      metricValue: domainMap.get("vehicle")?.metrics[0]
        ? `${domainMap.get("vehicle")!.metrics[0].value.toLocaleString()} ${domainMap.get("vehicle")!.metrics[0].unit}`
        : undefined,
      status: domainMap.get("vehicle")?.status,
    },
    {
      id: "food",
      title: "FoodLK",
      description: "Staple food prices and district meal-cost estimates.",
      href: "/food",
      sourceId: "food_platform_seed",
      metricLabel: domainMap.get("food")?.metrics[0]?.label,
      metricValue: domainMap.get("food")?.metrics[0]
        ? `LKR ${domainMap.get("food")!.metrics[0].value.toLocaleString()}`
        : undefined,
      status: domainMap.get("food")?.status,
    },
    {
      id: "cost-of-living",
      title: "Cost of Living",
      description: "Composite district index from fuel, property, and food proxies.",
      href: "/cost-of-living",
      sourceId: "cost_of_living_seed",
      metricLabel: "Components",
      metricValue: "Fuel · Property · Food",
      status: "healthy",
    },
  ];

  return cards;
}

export { getLifeOverview } from "./integrations/life";
