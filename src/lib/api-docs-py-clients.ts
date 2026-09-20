import clientsJson from "./api-docs-py-clients.json";

export type PyClientInfo = {
  slug: string;
  pip: string;
  module: string;
  className: string;
  endpointCount: number;
  methodCount: number;
  path: string;
};

export type PyClientsDoc = {
  version: number;
  clients: PyClientInfo[];
};

export const pyClientsDoc = clientsJson as PyClientsDoc;
