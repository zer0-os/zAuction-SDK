import { ApolloClient } from "@apollo/client/core";
import { ListAllSalesQueryOpts } from "../types";
import * as queries from "../queries";
import { TokenSaleCollection } from "../../types";
import * as helpers from "../helpers";

export const listAllSales = async <T>(
  apolloClient: ApolloClient<T>,
  wildToken: string
): Promise<TokenSaleCollection> => {
  const collection: TokenSaleCollection = {};
  const variables: ListAllSalesQueryOpts = {
    count: 1000,
    skipCount: 0,
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const sales = await helpers.listSales(
      apolloClient,
      queries.getAllTokenSales,
      variables,
      wildToken
    );

    for (const sale of sales) {
      if (!collection[sale.tokenId]) {
        collection[sale.tokenId] = [];
      }

      collection[sale.tokenId].push(sale);
    }

    /**
     * We will only get back up to `queryCount` # of sales
     * So if we get that many there's probably more sales we need
     * to fetch. If we got back less, we can stop querying
     */
    if (sales.length < variables.count) {
      break;
    }
    variables.skipCount += sales.length;
  }

  return collection;
};
