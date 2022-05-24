import { ApolloClient } from "@apollo/client/core";
import { ListSalesQueryOpts } from "../types";
import * as queries from "../queries";
import { TokenSale } from "../../types";
import { getLogger } from "../../utilities";

const logger = getLogger("subgraph:actions:listSales");

import * as helpers from "../helpers";

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string,
  tokenId: string,
  wildToken: string
): Promise<TokenSale[]> => {
  logger.trace(`Querying sales for domain with ID ${tokenId}`);

  const opts: ListSalesQueryOpts = {
    contract: contract.toLowerCase(),
    tokenId,
  };

  const sales = await helpers.listSales(
    apolloClient,
    queries.getTokenSalesForNftQuery,
    opts,
    wildToken
  );

  logger.trace(`Found ${sales.length} sales`);
  return sales;
};
