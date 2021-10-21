import { ApolloClient } from "@apollo/client/core";
import { TokenSalesDto } from "../types";
import * as queries from "../queries";
import { TokenSale, TokenSaleCollection } from "../../types";

export const listAllSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string
): Promise<TokenSaleCollection> => {
  const count = 1000;
  let skipCount = 0;

  const collection: TokenSaleCollection = {};

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const queryResult = await apolloClient.query<TokenSalesDto>({
      query: queries.getAllTokenSales,
      variables: {
        contract,
        count,
        skipCount,
      },
    });

    if (queryResult.error) {
      throw queryResult.error;
    }

    const queriedSales = queryResult.data.tokenSales.map((e) => {
      return {
        timestamp: e.timestamp,
        tokenId: e.tokenId,
        contract: e.contractAddress,
        saleAmount: e.amount,
        seller: e.seller.id,
        buyer: e.buyer.id,
      } as TokenSale;
    });

    for (const sale of queriedSales) {
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
    if (queriedSales.length < count) {
      break;
    }
    skipCount += queriedSales.length;
  }

  return collection;
};
