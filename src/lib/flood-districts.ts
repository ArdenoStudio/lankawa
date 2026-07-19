/** Static mapping of flood monitoring stations to administrative district slugs. */
const STATION_TO_DISTRICT: Record<string, string> = {
  "Nagalagam Street": "colombo",
  Hanwella: "colombo",
  Glencourse: "colombo",
  Kithulgala: "kegalle",
  Holombuwa: "kegalle",
  Deraniyagala: "kegalle",
  Norwood: "nuwara-eliya",
  Putupaula: "ratnapura",
  Ellagawa: "ratnapura",
  Rathnapura: "ratnapura",
  Magura: "ratnapura",
  Kalawellawa: "ratnapura",
  Baddegama: "galle",
  Thawalama: "galle",
  Thalgahagoda: "galle",
  Panadugama: "matara",
  Pitabeddara: "matara",
  Urawa: "matara",
  Moraketiya: "matara",
  Thanamalwila: "monaragala",
  Wellawaya: "monaragala",
  "Kuda Oya": "monaragala",
  Katharagama: "monaragala",
  Nakkala: "ampara",
  Siyambalanduwa: "monaragala",
  Padiyathalawa: "ampara",
  Manampitiya: "polonnaruwa",
  Weraganthota: "badulla",
  Peradeniya: "kandy",
  Nawalapitiya: "kandy",
  Thaldena: "badulla",
  Horowpothana: "anuradhapura",
  "Yaka Wewa": "anuradhapura",
  Thanthirimale: "anuradhapura",
  Galgamuwa: "kurunegala",
  Moragaswewa: "anuradhapura",
  Badalgama: "puttalam",
  Giriulla: "kurunegala",
  Dunamale: "kurunegala",
};

export function getFloodStationsForDistrict(slug: string): string[] {
  return Object.entries(STATION_TO_DISTRICT)
    .filter(([, districtSlug]) => districtSlug === slug)
    .map(([station]) => station)
    .sort((a, b) => a.localeCompare(b));
}

export function getDistrictForFloodStation(station: string): string | undefined {
  return STATION_TO_DISTRICT[station];
}
