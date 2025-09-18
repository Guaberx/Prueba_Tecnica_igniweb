// Cryptocurrency domain types

export interface Coin {
    id: number;
    name: string;
    symbol: string;
}

export interface CoinInfo {
    logo?: string;
    description?: string;
    category?: string;
    tags?: string[];
    date_added?: string;
    urls?: {
        website?: string[];
        twitter?: string[];
        reddit?: string[];
        technical_doc?: string[];
        source_code?: string[];
        explorer?: string[];
        message_board?: string[];
        announcement?: string[];
        chat?: string[];
    };
}

export interface CoinQuote {
    price: number;
    volume_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d?: number;
    percent_change_60d?: number;
    percent_change_90d?: number;
    market_cap: number;
    market_cap_dominance?: number;
    fully_diluted_market_cap?: number;
    last_updated: string;
}

export interface CoinData {
    id: number;
    name: string;
    symbol: string;
    slug?: string;
    is_active?: number;
    is_fiat?: number;
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    date_added?: string;
    num_market_pairs?: number;
    cmc_rank?: number;
    last_updated?: string;
    tags?: string[];
    platform?: {
        id: number;
        name: string;
        symbol: string;
        slug: string;
        token_address: string;
    } | null;
    self_reported_circulating_supply?: number | null;
    self_reported_market_cap?: number | null;
    quote: {
        USD: CoinQuote;
    };
}

export interface HistoricalDataPoint {
    timestamp: string;
    quote: {
        USD: {
            price: number;
            volume_24h: number;
            market_cap: number;
            circulating_supply?: number;
            total_supply?: number;
        };
    };
}

export interface HistoricalData {
    id: number;
    name: string;
    symbol: string;
    quotes: HistoricalDataPoint[];
}
