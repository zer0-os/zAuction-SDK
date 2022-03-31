import { ApolloClient } from "@apollo/client/core";
import { TokenBuyNowSalesDto } from "../types";
import * as queries from "../queries";
import { TokenBuy, TokenSale } from "../../types";

export const listBuyNowSales = async <T>(
  apolloClient: ApolloClient<T>,
  contractAddress: string,
  tokenId: string
): Promise<TokenBuy[]> => {
  
  const queryResult = await apolloClient.query<TokenBuyNowSalesDto>({
    query: queries.getBuyNowTokenSales,
    variables: {
      contractAddress,
      tokenId,
    },
  });

  if (queryResult.error) {
    throw queryResult.error;
  }

  const buys: TokenBuy[] = queryResult.data.tokenBuyNowSales.map((e) => {
    return {
      tokenId: e.tokenId,
      contract: e.contractAddress,
      amount: e.amount,
      seller: e.seller.id,
      buyer: e.buyer.id,
    } as TokenBuy;
  });

  return buys;
};
