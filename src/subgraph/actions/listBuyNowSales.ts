import { ApolloClient } from "@apollo/client/core";
import { TokenBuyNowSalesDto } from "../types";
import * as queries from "../queries";
import { TokenBuy } from "../../types";

export const listBuyNowSales = async <T>(
  apolloClient: ApolloClient<T>,
  contractAddress: string,
  tokenId: string
): Promise<TokenBuy[]> => {
  
  const queryResult = await apolloClient.query<TokenBuyNowSalesDto>({
    query: queries.getBuyNowTokenSales,
    variables: {
      contractAddress: contractAddress.toLowerCase(),
      tokenId
    },
  });

  if (queryResult.error) {
    throw queryResult.error;
  }

  const buys: TokenBuy[] = queryResult.data.domainTokenSolds.map((e) => {
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
