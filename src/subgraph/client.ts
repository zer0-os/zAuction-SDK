import * as apollo from "@apollo/client/core";
import fetch from "cross-fetch";
import { TokenBuy, TokenSale, TokenSaleCollection } from "../types";
import * as actions from "./actions";
import { getLogger } from "../utilities";

export interface SubgraphClient {
  listSales: (contract: string, tokenId: string) => Promise<TokenSale[]>;
  listBuyNowSales: (contract: string, tokenId: string) => Promise<TokenBuy[]>;
  listAllSales: () => Promise<TokenSaleCollection>;
}

const createApolloClient = (
  subgraphUri: string
): apollo.ApolloClient<apollo.NormalizedCacheObject> => {
  const client = new apollo.ApolloClient({
    link: new apollo.HttpLink({ uri: subgraphUri, fetch }),
    cache: new apollo.InMemoryCache(),
  });

  return client;
};

export const createClient = (subgraphUri: string, wildToken: string): SubgraphClient => {
  const apolloClient = createApolloClient(subgraphUri);

  const logger = getLogger("subgraph:client");
  const subgraphClient: SubgraphClient = {
    listSales: (contract: string, tokenId: string) => {
      logger.debug(`Get sales for domain: ${tokenId}`);
      return actions.listSales(apolloClient, contract, tokenId, wildToken);
    },
    listBuyNowSales: (contract: string, tokenId: string) => {
      logger.debug(`Get "buy now" sales for domain: ${tokenId}`);
      return actions.listBuyNowSales(apolloClient, contract, tokenId, wildToken);
    },
    listAllSales: () => {
      logger.debug(`Get all sales`);
      return actions.listAllSales(apolloClient, wildToken);
    },
  };

  return subgraphClient;
};
