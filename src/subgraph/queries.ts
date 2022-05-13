import { gql } from "@apollo/client/core";

export const getTokenSalesForNftQuery = gql`
  query TokenSales($contract: Bytes!, $tokenId: ID!) {
    tokenSales(where: { tokenId: $tokenId, contractAddress: $contract }) {
      id
      tokenId
      contractAddress
      amount
      timestamp
      seller {
        id
      }
      buyer {
        id
      }
    }
  }
`;

export const getBuyNowTokenSales = gql`
  query DomainTokenSolds($tokenId: String!, $contractAddress: Bytes!) {
    domainTokenSolds(where: { tokenId: $tokenId, contractAddress: $contractAddress }) {
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
    }
  }
`;

export const getAllTokenSales = gql`
  query TokenSales($count: Int!, $skipCount: Int!) {
    tokenSales(
      first: $count
      skip: $skipCount
    ) {
      id
      tokenId
      contractAddress
      amount
      timestamp
      seller {
        id
      }
      buyer {
        id
      }
    }
  }
`;
