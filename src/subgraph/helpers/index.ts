import { ApolloClient, DocumentNode } from "@apollo/client/core";
import { ListAllSalesQueryOpts, ListSalesQueryOpts, TokenSalesDto } from "../types";
import { TokenSale } from "../../types";

export const listSales = async <T>(
  apolloClient: ApolloClient<T>,
  query: DocumentNode,
  variables: ListSalesQueryOpts | ListAllSalesQueryOpts,
  wildToken: string,
) => {
  const queryResult = await apolloClient.query<TokenSalesDto>({
    query: query,
    variables: variables
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
      paymentToken: e.paymentToken ?? wildToken,
      topLevelDomainId: e.topLevelDomainId
    }
    return sale;
  });
  return sales;
};
