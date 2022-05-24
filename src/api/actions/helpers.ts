import fetch from "cross-fetch";
import { Bid } from "../../types";
import { BidDto } from "../types";

export const makeApiCall = async <T>(
  url: string,
  method: "GET" | "POST",
  body?: string | Record<string, unknown>,
  softFail?: boolean,
  softFailMessage?: string
): Promise<T> => {
  const headers: Record<string, string> = {};

  if (body) {
    if (typeof body !== "string") {
      body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
      headers["Access-Control-Allow-Origin"] = "*";
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

  if (softFail) {
    const returnedBody = await res.json();
    returnedBody["softFailMessage"] = softFailMessage;
    return returnedBody as T;
  } else {
    const returnedBody = await res.json();
    return returnedBody as T;
  }
};

export const convertBidDtoToBid = (bid: BidDto): Bid => {
  const localBid: Bid = {
    bidNonce: bid.bidNonce,
    bidder: bid.account,
    bidToken: bid.bidToken ?? "",
    contract: bid.contractAddress,
    tokenId: bid.tokenId,
    amount: bid.bidAmount,
    startBlock: bid.startBlock,
    expireBlock: bid.expireBlock,
    signedMessage: bid.signedMessage,
    timestamp: bid.date.toString(),
    version: bid.version,
  };

  return localBid;
};
