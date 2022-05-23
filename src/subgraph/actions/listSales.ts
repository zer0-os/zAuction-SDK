import { ApolloClient } from "@apollo/client/core";
import { TokenSalesDto } from "../types";
import * as queries from "../queries";
import { TokenSale } from "../../types";
import { getLogger } from "../../utilities";

const logger = getLogger("subgraph:actions:listSales");

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string,
  tokenId: string
): Promise<TokenSale[]> => {
  logger.trace(`Querying sales for domain with ID ${tokenId}`);
  const queryResult = await apolloClient.query<TokenSalesDto>({
    query: queries.getTokenSalesForNftQuery,
    variables: {
      contract: contract.toLowerCase(),
      tokenId,
    },
  });

  if (queryResult.error) {
    throw queryResult.error;
  }

  const sales: TokenSale[] = queryResult.data.tokenSales.map((e) => {
    return {
      timestamp: e.timestamp,
      tokenId: e.tokenId,
      contract: e.contractAddress,
      saleAmount: e.amount,
      seller: e.seller.id,
      buyer: e.buyer.id,
    } as TokenSale;
  });

  logger.trace(`Found ${sales.length} sales`)
  return sales;
};
