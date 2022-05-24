import { ApolloClient } from "@apollo/client/core";
import { ListSalesQueryOpts } from "../types";
import * as queries from "../queries";
import { TokenSale } from "../../types";
import * as helpers from "../helpers";

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string,
  tokenId: string,
  wildToken: string
): Promise<TokenSale[]> => {

  const variables: ListSalesQueryOpts = {
    contract: contract.toLowerCase(),
    tokenId
  }
  const sales = await helpers.listSales(
    apolloClient,
    queries.getTokenSalesForNftQuery,
    variables,
    wildToken
  );
  return sales;
};
