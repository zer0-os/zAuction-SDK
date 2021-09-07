import * as apollo from "@apollo/client/core";
import fetch from "cross-fetch";
import { NftSale } from "../types";
import * as actions from "./actions";

export interface SubgraphClient {
  listSales: (contract: string, tokenId: string) => Promise<NftSale[]>;
}

const createApolloClient = (subgraphUri: string) => {
  const client = new apollo.ApolloClient({
    link: new apollo.HttpLink({ uri: subgraphUri, fetch }),
    cache: new apollo.InMemoryCache(),
  });

  return client;
};

const createSubgraphClient = (subgraphUri: string) => {
  const apolloClient = createApolloClient(subgraphUri);

  const subgraphClient: SubgraphClient = {
    listSales: (contract: string, tokenId: string) => {
      return actions.listSales(apolloClient, contract, tokenId);
    },
  };

  return subgraphClient;
};
