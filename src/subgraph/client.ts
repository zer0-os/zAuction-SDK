import * as apollo from "@apollo/client/core";
import fetch from "cross-fetch";
import { TokenBuy, TokenSale, TokenSaleCollection } from "../types";
import * as actions from "./actions";

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

export const createClient = (subgraphUri: string): SubgraphClient => {
  const apolloClient = createApolloClient(subgraphUri);

  const subgraphClient: SubgraphClient = {
    listSales: (contract: string, tokenId: string) => {
      return actions.listSales(apolloClient, contract, tokenId);
    },
    listBuyNowSales: (contract: string, tokenId: string) => {
      return actions.listBuyNowSales(apolloClient, contract, tokenId);
    },
    listAllSales: () => {
      return actions.listAllSales(apolloClient);
    },
  };

  return subgraphClient;
};
