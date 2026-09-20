import clientsJson from "./api-docs-ts-clients.json";

export type TsClientInfo = {
  slug: string;
  npm: string;
  className: string;
  endpointCount: number;
  methodCount: number;
  path: string;
};

export type TsClientsDoc = {
  version: number;
  clients: TsClientInfo[];
};

export const tsClientsDoc = clientsJson as TsClientsDoc;
