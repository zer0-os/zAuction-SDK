import fetch from "cross-fetch";
import { ethers } from "ethers";
import { Bid } from "../../types";
import { BidDto } from "../types";

export const makeApiCall = async <T>(
  url: string,
  method: "GET" | "POST",
  body?: string | Record<string, unknown>,
  softFail?: boolean
): Promise<T> => {
  const headers: Record<string, string> = {};

  if (body) {
    if (typeof body !== "string") {
      body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method,
    body,
    headers,
  });

  if (res.status !== 200 && !softFail) {
    throw Error(`Request failed with code ${res.status}: ${await res.text()}`);
  }

  const returnedBody = await res.json();
  return returnedBody as T;
};

export const convertBidDtoToBid = (bid: BidDto): Bid => {
  const localBid: Bid = {
    auctionId: bid.auctionId,
    bidder: bid.account,
    contract: bid.contractAddress,
    tokenId: bid.tokenId,
    amount: bid.bidAmount,
    startBlock: bid.startBlock,
    expireBlock: bid.expireBlock,
    signedMessage: bid.signedMessage,
    timestamp: bid.date.toString(),
  };

  return localBid;
};

export const calculateNftId = (contract: string, tokenId: string): string => {
  const idString = contract + tokenId;
  const idStringBytes = ethers.utils.toUtf8Bytes(idString);
  const nftId = ethers.utils.keccak256(idStringBytes);

  return nftId;
};
