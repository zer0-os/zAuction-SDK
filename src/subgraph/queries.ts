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
  query DomainTokenSolds($tokenId: String!, $contractAddress: String!) {
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
    }
  }
`;

export const getAllTokenSales = gql`
  query TokenSales($contract: Bytes!, $count: Int!, $skipCount: Int!) {
    tokenSales(
      where: { contractAddress: $contract }
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
