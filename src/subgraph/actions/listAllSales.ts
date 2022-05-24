import { ApolloClient } from "@apollo/client/core";
import { ListAllSalesQueryOpts } from "../types";
import * as queries from "../queries";
import { getLogger } from "../../utilities";

const logger = getLogger("subgraph:actions:listAllSales");
import { TokenSaleCollection } from "../../types";
import * as helpers from "../helpers";

export const listAllSales = async <T>(
  apolloClient: ApolloClient<T>,
  wildToken: string
): Promise<TokenSaleCollection> => {
  const collection: TokenSaleCollection = {};
  const opts: ListAllSalesQueryOpts = {
    count: 1000,
    skipCount: 0,
  };

  // eslint-disable-next-line no-constant-condition
  let allSalesLength = 0;
  while (true) {
    logger.trace(`Querying for ${opts.count} sales starting at ${opts.skipCount}`);

    const sales = await helpers.listSales(
      apolloClient,
      queries.getAllTokenSales,
      opts,
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
    if (sales.length < opts.count) {
      break;
    }
    opts.skipCount += sales.length;
  }

  logger.trace(`Found ${allSalesLength} sales for all domains`)
  return collection;
};
