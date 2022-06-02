import { gql } from "@apollo/client/core";

export const getTokenSalesForNftQuery = gql`
  query TokenSales($contract: Bytes!, $tokenId: ID!) {
    tokenSales(where: { tokenId: $tokenId, contractAddress: $contract }) {
      id
      bidNonce
      tokenId
      contractAddress
      amount
      buyer {
        id
      }
      seller {
        id
      }
      timestamp
      paymentToken
      topLevelDomainId
    }
  }
`;

export const getBuyNowTokenSales = gql`
  query DomainTokenSolds($tokenId: String!, $contractAddress: Bytes!) {
    domainTokenSolds(
      where: { tokenId: $tokenId, contractAddress: $contractAddress }
    ) {
      id
      buyer {
        id
      }
      seller {
        id
      }
      amount
      tokenId
      contractAddress
      timestamp
      paymentToken
      topLevelDomainId
    }
  }
`;

export const getBuyNowTokenListings = gql`
  query BuyNowListings($count: Int!, $skipCount: Int!) {
    buyNowListings(first: $count, skip: $skipCount) {
      id
      amount
      paymentToken
    }
  }
`;

export const getAllTokenSales = gql`
  query TokenSales($count: Int!, $skipCount: Int!) {
    tokenSales(first: $count, skip: $skipCount) {
      id
      bidNonce
      tokenId
      contractAddress
      amount
      buyer {
        id
      }
      seller {
        id
      }
      timestamp
      paymentToken
      topLevelDomainId
    }
  }
`;
