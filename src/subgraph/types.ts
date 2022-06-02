export interface AccountDto {
  id: string;
}

export interface BuyNowListingDto {
  id: string; // Will be the tokenId
  amount: string;
  paymentToken: string;
}

export interface TokenBuyNowListingsDto {
  buyNowListings: BuyNowListingDto[];
}

export interface TokenSaleDto {
  id: string;
  bidNonce: string;
  tokenId: string;
  contractAddress: string;
  amount: string;
  buyer: AccountDto;
  seller: AccountDto;
  timestamp: string;
  paymentToken?: string;
  topLevelDomainId: string;
}

export interface TokenSalesDto {
  tokenSales: TokenSaleDto[];
}

export interface TokenBuyNowSaleDto {
  id: string;
  buyer: AccountDto;
  seller: AccountDto;
  amount: string;
  tokenId: string;
  contractAddress: string;
  timestamp: string;
  paymentToken?: string;
  topLevelDomainId: string;
}

export interface TokenBuyNowSalesDto {
  domainTokenSolds: TokenBuyNowSaleDto[];
}

export interface ListAllSalesQueryOptions {
  count: number;
  skipCount: number;
}

export interface ListAllBuyNowListingsQueryOptions
  extends ListAllSalesQueryOptions {}

export interface ListSalesQueryOptions {
  contract: string;
  tokenId: string;
}
