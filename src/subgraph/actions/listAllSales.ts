import { ApolloClient } from "@apollo/client/core";
import { ListAllSalesQueryOptions } from "../types";
import { getLogger } from "../../utilities";
import { TokenSaleCollection } from "../../types";
import * as queries from "../queries";
import * as helpers from "../helpers";

const logger = getLogger("subgraph:actions:listAllSales");

export const listAllSales = async <T>(
  apolloClient: ApolloClient<T>,
  wildToken: string
): Promise<TokenSaleCollection> => {
  const collection: TokenSaleCollection = {};
  const options: ListAllSalesQueryOptions = {
    count: 1000,
    skipCount: 0,
  };

  // eslint-disable-next-line no-constant-condition
  let allSalesLength = 0;
  while (true) {
    logger.trace(
      `Querying for ${options.count} sales starting at ${options.skipCount}`
    );

    const sales = await helpers.listSales(
      apolloClient,
      queries.getAllTokenSales,
      options,
      wildToken
    );

    for (const sale of sales) {
      if (!collection[sale.tokenId]) {
        collection[sale.tokenId] = [];
      }

      collection[sale.tokenId].push(sale);
      allSalesLength++;
    }

    /**
     * We will only get back up to `queryCount` # of sales
     * So if we get that many there's probably more sales we need
     * to fetch. If we got back less, we can stop querying
     */
    if (sales.length < options.count) {
      break;
    }
    options.skipCount += sales.length;
  }

  logger.trace(`Found ${allSalesLength} sales for all domains`);
  return collection;
};
