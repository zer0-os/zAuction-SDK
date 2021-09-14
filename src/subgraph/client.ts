import * as apollo from "@apollo/client/core";
import fetch from "cross-fetch";
import { TokenSale } from "../types";
import * as actions from "./actions";

export interface SubgraphClient {
  listSales: (contract: string, tokenId: string) => Promise<TokenSale[]>;
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
  };

  return subgraphClient;
};
