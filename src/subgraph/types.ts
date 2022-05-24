export interface AccountDto {
  id: string;
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

export interface ListAllSalesQueryOpts {
  count: number;
  skipCount: number;
}

export interface ListSalesQueryOpts {
  contract: string;
  tokenId: string;
}
