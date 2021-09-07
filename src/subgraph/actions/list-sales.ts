import { ApolloClient } from "@apollo/client/core";
import { TokenSalesDto } from "../types";
import * as queries from "../queries";
import { NftSale } from "../../types";

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string,
  tokenId: string
) => {
  const queryResult = await apolloClient.query<TokenSalesDto>({
    query: queries.getTokenSalesForNftQuery,
    variables: {
      contract,
      tokenId,
    },
  });

  if (queryResult.error) {
    throw queryResult.error;
  }

  const sales: NftSale[] = queryResult.data.tokenSales.map((e) => {
    return {
      timestamp: e.timestamp,
      tokenId: e.tokenId,
      contract: e.contractAddress,
      saleAmount: e.amount,
      seller: e.seller.id,
      buyer: e.buyer.id,
    } as NftSale;
  });

  return sales;
};
