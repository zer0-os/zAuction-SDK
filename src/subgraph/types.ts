export interface AccountDto {
  id: string;
}

export interface TokenSaleDto {
  id: string;
  tokenId: string;
  contractAddress: string;
  amount: string;
  buyer: AccountDto;
  seller: AccountDto;
  timestamp: string;
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
}

export interface TokenBuyNowSalesDto {
  domainTokenSolds: TokenBuyNowSaleDto[];
}