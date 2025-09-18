// API response types

export interface ApiStatus {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice?: string | null;
}

// Coin search result
export interface CoinSearchResult {
    coin_id: number;
    symbol: string;
    name: string;
    slug: string;
    rank: number;
    logo: string;
    description: string;
    website: string;
    category: string;
}

// Common type for arrays of coin search results
export type CoinSearchResults = CoinSearchResult[];

// Historical data response
export interface HistoricalQuote {
    timestamp: string;
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    last_updated: string;
}

export interface HistoricalCoinData {
    coin_id: number;
    coin: CoinSearchResult;
    quotes: HistoricalQuote[];
}

export interface CoinsHistoricalResponse extends Array<HistoricalCoinData> {}

// Latest quotes response
export interface LatestQuoteData {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    is_active: number;
    is_fiat: number | null;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    date_added: string;
    num_market_pairs: number;
    cmc_rank: number;
    last_updated: string;
    tags: string[];
    platform: any;
    self_reported_circulating_supply: any;
    self_reported_market_cap: any;
    quote: {
        USD: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            last_updated: string;
        };
    };
}

export interface CoinsLatestResponse {
    status: ApiStatus;
    data: Record<string, LatestQuoteData>;
}

// User management
export interface UserSignupRequest {
    username: string;
    password: string;
    email: string;
}

export interface UserSignupResponse {
    success: boolean;
    user_id?: number;
    message?: string;
}

// Watchlist
export type WatchlistResponse = CoinSearchResults;

export interface AddToWatchlistRequest {
    coinIds: number[];
}

export interface AddToWatchlistResponse {
    success: boolean;
}
