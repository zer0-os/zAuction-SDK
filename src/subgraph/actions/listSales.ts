import { ApolloClient } from "@apollo/client/core";
import { TokenSalesDto } from "../types";
import * as queries from "../queries";
import { TokenSale } from "../../types";

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  contract: string,
  tokenId: string
): Promise<TokenSale[]> => {
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
    const sale: TokenSale = {
      bidNonce: e.bidNonce,
      timestamp: e.timestamp,
      tokenId: e.tokenId,
      contract: e.contractAddress,
      saleAmount: e.amount,
      seller: e.seller.id,
      buyer: e.buyer.id,
      paymentToken: e.paymentToken ?? "",
      topLevelDomainId: e.topLevelDomainId ?? ""
    }
    return sale;
  });
  return sales;
};
