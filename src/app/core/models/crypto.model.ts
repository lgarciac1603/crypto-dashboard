export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  market_cap?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  circulating_supply?: number;
  ath?: number;
  atl?: number;
}

export interface CryptoDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      [key: string]: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      [key: string]: number;
    };
    market_cap_rank: number;
    total_volume: {
      [key: string]: number;
    };
    high_24h: {
      [key: string]: number;
    };
    low_24h: {
      [key: string]: number;
    };
    circulating_supply: number;
    ath: {
      [key: string]: number;
    };
    atl: {
      [key: string]: number;
    };
  };
}
