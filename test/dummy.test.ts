import * as zAuction from "../src";

describe("test", () => {
  it("does a thing", async () => {
    const instance: zAuction.Instance = zAuction.createInstance(
      "",
      "https://api.thegraph.com/subgraphs/name/zer0-os/zauction-kovan",
      ""
    );

    const res = await instance.listSales(
      "0xc613fcc3f81cc2888c5cccc1620212420ffe4931",
      "0x1826d0097ca8750c439fa6422692a9a01704cd47b3533adb3e82ab70cc2b6158"
    );

    console.log(res);
  });
});
