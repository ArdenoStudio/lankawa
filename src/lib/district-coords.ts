/** Approximate district-capital coordinates for Open-Meteo (civic morning check). */

export interface DistrictCoords { latitude: number; longitude: number; }

export const DISTRICT_COORDS: Record<string, DistrictCoords> = {
  "colombo": { latitude: 6.9271, longitude: 79.8612 },
  "gampaha": { latitude: 7.0917, longitude: 79.9999 },
  "kalutara": { latitude: 6.5854, longitude: 79.9607 },
  "kandy": { latitude: 7.2906, longitude: 80.6337 },
  "matale": { latitude: 7.4675, longitude: 80.6234 },
  "nuwara-eliya": { latitude: 6.9497, longitude: 80.7891 },
  "galle": { latitude: 6.0535, longitude: 80.221 },
  "matara": { latitude: 5.9549, longitude: 80.555 },
  "hambantota": { latitude: 6.1241, longitude: 81.1185 },
  "jaffna": { latitude: 9.6615, longitude: 80.0255 },
  "kilinochchi": { latitude: 9.3803, longitude: 80.377 },
  "mannar": { latitude: 8.981, longitude: 79.9044 },
  "vavuniya": { latitude: 8.7514, longitude: 80.4971 },
  "mullaitivu": { latitude: 9.2671, longitude: 80.8142 },
  "batticaloa": { latitude: 7.7102, longitude: 81.6924 },
  "ampara": { latitude: 7.3018, longitude: 81.6747 },
  "trincomalee": { latitude: 8.5874, longitude: 81.2152 },
  "kurunegala": { latitude: 7.4818, longitude: 80.3609 },
  "puttalam": { latitude: 8.0362, longitude: 79.8283 },
  "anuradhapura": { latitude: 8.3114, longitude: 80.4037 },
  "polonnaruwa": { latitude: 7.9403, longitude: 81.0188 },
  "badulla": { latitude: 6.9934, longitude: 81.055 },
  "monaragala": { latitude: 6.8728, longitude: 81.3507 },
  "ratnapura": { latitude: 6.7056, longitude: 80.3886 },
  "kegalle": { latitude: 7.2513, longitude: 80.3464 },
};

export function getDistrictCoords(slug: string | null | undefined): DistrictCoords {
  if (slug && DISTRICT_COORDS[slug]) {
    return DISTRICT_COORDS[slug];
  }
  return DISTRICT_COORDS.colombo;
}
