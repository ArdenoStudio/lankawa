/**
 * P45 — deepen a handful of local-gov bodies with contact / meeting fields.
 * Overlay keeps the large directory JSON lean.
 */
export interface LocalGovContactDeepen {
  phone?: string;
  website?: string;
  meetingNote?: string;
  officeAddress?: string;
}

const CONTACTS: Record<string, LocalGovContactDeepen> = {
  "colombo-mc-1": {
    phone: "+94 11 2691 291",
    website: "https://www.colombo.mc.gov.lk",
    meetingNote: "Council sittings typically mid-month (verify gazette).",
    officeAddress: "Town Hall, Colombo 07",
  },
  "colombo-ps-2": {
    phone: "+94 11 2862 261",
    meetingNote: "Pradeshiya Sabha agenda published locally when available.",
    officeAddress: "Sri Jayawardenepura Kotte",
  },
  "gampaha-mc-12": {
    phone: "+94 33 2222 261",
    meetingNote: "Municipal council contact deepen — seed phone.",
  },
  "kandy-mc-39": {
    phone: "+94 81 2222 261",
    officeAddress: "Kandy Municipal Council",
  },
  "galle-mc-79": {
    phone: "+94 91 2234 151",
    officeAddress: "Galle Municipal Council",
    meetingNote: "Coastal MC — verify cyclone/flood notices with DMC.",
  },
};

export function getLocalGovContactDeepen(
  bodyId: string,
): LocalGovContactDeepen | undefined {
  return CONTACTS[bodyId];
}

export function mergeLocalGovContact<T extends { id: string }>(
  body: T,
): T & LocalGovContactDeepen {
  const deepen = getLocalGovContactDeepen(body.id);
  return deepen ? { ...body, ...deepen } : body;
}
