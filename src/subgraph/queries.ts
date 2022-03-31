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
  query DomainTokenSolds($contract: Bytes!, $tokenId: BigInt!) {
    domainTokenSolds(where: { tokenId: $tokenId, contractAddress: $contract }) {
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
