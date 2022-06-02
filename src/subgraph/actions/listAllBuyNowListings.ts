import { ApolloClient } from "@apollo/client/core";
import {
  ListAllBuyNowListingsQueryOptions,
  TokenBuyNowListingsDto,
} from "../types";
import { TokenBuyNowListing, TokenBuyNowListingCollection } from "../../types";
import * as queries from "../queries";
import { getLogger } from "../../utilities";

const logger = getLogger("subgraph:actions:listAllSales");

export const listAllBuyNowListings = async <T>(
  apolloClient: ApolloClient<T>,
  wildToken: string
): Promise<TokenBuyNowListingCollection> => {
  const collection: TokenBuyNowListingCollection = {};

  const options: ListAllBuyNowListingsQueryOptions = {
    count: 1000,
    skipCount: 0,
  };

  let allListingsLength = 0;
  while (true) {
    logger.trace(
      `Querying for ${options.count} buy now listings starting at ${options.skipCount}`
    );

    const queryResult = await apolloClient.query<TokenBuyNowListingsDto>({
      query: queries.getBuyNowTokenListings,
      variables: {
        ...options,
      },
    });

    if (queryResult.error) {
      throw queryResult.error;
    }

    const listings: TokenBuyNowListing[] =
      queryResult.data.buyNowListings.map((e) => {
        const listing: TokenBuyNowListing = {
          tokenId: e.id,
          amount: e.amount,
          paymentToken: e.paymentToken ?? wildToken,
        };
        return listing;
      });

    for (const listing of listings) {
      if(!collection[listing.tokenId]) {
        collection[listing.tokenId] = [];
      }
      collection[listing.tokenId].push(listing);
      allListingsLength++;
    }

    if(listings.length < options.count) {
      break;
    }
  }

  logger.trace(`Found ${allListingsLength} buy now listings`)
  return collection;
};
