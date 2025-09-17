
export interface CMCBaseResponse {
    status: {
        timestamp: string;   // ISO date string from API,
        error_code: number,
        error_message: string,
        elapsed: number,
        credit_count: number,
        notice: string
    },
    data: { [key: string]: any }
}

type CMCPlatform = {
    id: number,
    name: string,
    symbol: string,
    slug: string,
    token_address: string,
}

// /map
type CMCMapElement = {
    id: number,
    rank: number,
    name: string,
    symbol: string,
    slug: string,
    is_active: 1 | 0,
    status: number,
    first_historical_data: string,   // ISO date string from API,
    last_historical_data: string,  // ISO date string from API,
    platform: null | CMCPlatform,
}

export interface CMCMapResponse extends CMCBaseResponse {
    date: CMCMapElement[]
}

// /info
type CMCInfoElement = {
    urls: {
        website: string[],
        technical_doc: string[],
        twitter: string[],
        reddit: string[],
        message_board: string[],
        announcement: string[],
        chat: string[],
        explorer: string[],
        source_code: string[]
    },
    logo: string,
    id: number,
    name: string,
    symbol: string,
    slug: string,
    description: string,
    date_added: string,
    date_launched: string,
    tags: string[],
    platform: null | CMCPlatform,
    category: string,
}
export interface CMCInfoResponse extends CMCBaseResponse {
    data: Record<string, CMCInfoElement>
}

// /quotes/historical
type CMCQuotesHistoricalQuote = {
    timestamp: string,   // ISO date string from API,
    quote: {
        USD: {
            price: number,
            volume_24h: number,
            market_cap: number,
            circulating_supply: number,
            total_supply: number,
            timestamp: string,   // ISO date string from API,
        },
        BTC?: {
            price: number,
            volume_24h: number,
            market_cap: number,
            circulating_supply: number,
            total_supply: number,
            timestamp: string,   // ISO date string from API,
        }
    }
}

type CMCQuotesHistoricalElement = {
    id: number,
    name: string,
    symbol: string,
    is_active: number,
    is_fiat: number | null,
    quotes: CMCQuotesHistoricalQuote[]
}
export interface CMCQuotesHistorical extends CMCBaseResponse {
    data: Record<string, CMCQuotesHistoricalElement>
}

// /quotes/latest
type CMCQuotesLatestQuote = {
    timestamp: string,   // ISO date string from API,
    quote: {
        USD: {
            price: number,
            volume_24h: number,
            volume_change_24h: number,
            percent_change_1h: number,
            percent_change_24h: number,
            percent_change_7d: number,
            percent_change_30d: number,
            market_cap: number,
            market_cap_dominance: number,
            fully_diluted_market_cap: number,
            last_updated: string,   // ISO date string from API,
        },
        BTC?: {
            price: number,
            volume_24h: number,
            volume_change_24h: number,
            percent_change_1h: number,
            percent_change_24h: number,
            percent_change_7d: number,
            percent_change_30d: number,
            market_cap: number,
            market_cap_dominance: number,
            fully_diluted_market_cap: number,
            last_updated: string,   // ISO date string from API,
        },
    }
}
type CMCQuotesLatestElement = {
    id: number,
    name: string,
    symbol: string,
    slug: string,
    is_active: number,
    is_fiat: null | any,
    circulating_supply: number,
    total_supply: number,
    max_supply: number,
    date_added: string,   // ISO date string from API,
    num_market_pairs: number,
    cmc_rank: number,
    last_updated: string,   // ISO date string from API,
    tags: string[]
    platform: null | CMCPlatform,
    self_reported_circulating_supply: null | any,
    self_reported_market_cap: null | any,
    quote: CMCQuotesLatestQuote
}
export interface CMCQuotesLatest extends CMCBaseResponse {
    data: Record<string, CMCQuotesLatestElement>
}