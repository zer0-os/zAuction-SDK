import * as subgraph from "./subgraph";
import { NftSale } from "./types";

export * from "./types";

export interface Instance {
  listSales: (contract: string, tokenId: string) => Promise<NftSale[]>;
}

export const createInstance = (
  apiUri: string,
  subgraphUri: string,
  zAuctionContractAddress: string
) => {
  const subgraphClient = subgraph.createClient(subgraphUri);

  const instance: Instance = {
    listSales: subgraphClient.listSales,
  };

  return instance;
};
