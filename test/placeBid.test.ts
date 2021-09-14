import { expect } from "chai";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { placeBid } from "../src/actions";

chai.use(chaiAsPromised);

describe("Place Bid Action", () => {
  it("updates status after each step", async () => {
    const encodeBid = sinon.fake.returns({
      message: "0x01",
      bid: {},
    });
    const signMessage = sinon.fake.returns("0x0");
    const submitBid = sinon.fake();
    const callback = sinon.fake();

    await placeBid({
      bid: {
        tokenId: "0x1",
        bidAmount: "100",
      },
      contract: "0x0",
      bidder: "0x0",
      encodeBid,
      signMessage,
      submitBid,
      statusCallback: callback,
    });

    expect(callback.callCount).to.eq(4);
  });

  it("throws an exception if the bid to sign is invalid length", async () => {
    const encodeBid = sinon.fake.returns({
      message: "0x1",
      bid: {},
    });
    const signMessage = sinon.fake.returns("0x0");
    const submitBid = sinon.fake();
    const callback = sinon.fake();

    const func = placeBid({
      bid: {
        tokenId: "0x1",
        bidAmount: "100",
      },
      contract: "0x0",
      bidder: "0x0",
      encodeBid,
      signMessage,
      submitBid,
      statusCallback: callback,
    });

    await expect(func).to.be.rejected;
  });

  it("throws an exception if signing the bid is rejected", async () => {
    const encodeBid = sinon.fake.returns({
      message: "0x12",
      bid: {},
    });
    const signMessage = sinon.fake.rejects("rejected");
    const submitBid = sinon.fake();
    const callback = sinon.fake();

    const func = placeBid({
      bid: {
        tokenId: "0x1",
        bidAmount: "100",
      },
      contract: "0x0",
      bidder: "0x0",
      encodeBid,
      signMessage,
      submitBid,
      statusCallback: callback,
    });

    await expect(func).to.be.rejectedWith(
      "Failed to sign bid message: Error: rejected"
    );
  });
});
