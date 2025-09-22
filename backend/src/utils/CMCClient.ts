import AppError from "@/utils/AppError";
import { CMCMapResponse, CMCInfoResponse, CMCQuotesLatest, CMCQuotesHistorical } from "@/models/CMCModels";

export class CMCClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor() {
        this.baseUrl = process.env.COINMARKETCAP_BASE_URL || "";
        this.apiKey = process.env.COINMARKETCAP_API_KEY || "";

        if (!this.baseUrl) {
            throw new AppError("CMC base URL not configured", "INTERNAL_ERROR");
        }

        if (!this.apiKey) {
            throw new AppError("CMC API key not configured", "INTERNAL_ERROR");
        }
    }

    private getHeaders() {
        return {
            "Accept": "application/json",
            "X-CMC_PRO_API_KEY": this.apiKey
        };
    }

    private async handleResponse<T>(response: Response, endpoint: string): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 401) {
                throw new AppError("CMC API authentication failed. Please check your API key.", "INTERNAL_ERROR");
            } else if (response.status === 403) {
                throw new AppError("CMC API access forbidden. Your API key may not have permission for this endpoint, or you're using sandbox which has restrictions.", "INTERNAL_ERROR");
            } else if (response.status === 429) {
                throw new AppError("CMC API rate limit exceeded. Please wait before retrying.", "INTERNAL_ERROR");
            } else {
                throw new AppError(`CMC ${endpoint} API error: ${response.status} ${response.statusText}`, "INTERNAL_ERROR");
            }
        }

        return response.json() as T;
    }

    async fetchMap(): Promise<CMCMapResponse> {
        let completeUrl = `${this.baseUrl}${process.env.MAP}`;
        if (process.env.MAP_LIMIT) {
            const limit = Number(process.env.MAP_LIMIT);
            if (limit > 0 && limit <= 5000) {
                completeUrl = `${this.baseUrl}${process.env.MAP}?limit=${limit}`;
            }

        }

        const response = await fetch(completeUrl, { headers: this.getHeaders() });
        return this.handleResponse<CMCMapResponse>(response, "/map");
    }

    async fetchInfo(coinIds: number[]): Promise<CMCInfoResponse> {
        const max_batch_size = 1000;
        const batches: number[][] = []
        for (let i = 0; i < coinIds.length; i += max_batch_size) {
            batches.push(coinIds.slice(i, i + max_batch_size))
        }
        const p = batches.map(cIds => {
            return fetch(`${this.baseUrl}${process.env.INFO}?id=${cIds.join(",")}`, { headers: this.getHeaders() });
        });

        const responses = await Promise.all(p);
        const data: CMCInfoResponse[] = await Promise.all(responses.map(r => this.handleResponse<CMCInfoResponse>(r, "/info")));

        return data.reduce((prev, current) => ({ ...prev, data: { ...prev.data, ...current.data } }), { data: {}, status: {} } as CMCInfoResponse);

        // const response = await fetch(`${this.baseUrl}${process.env.INFO}?id=${coinIds}`, { headers: this.getHeaders() });
        // return this.handleResponse<CMCInfoResponse>(response, "/info");
    }

    async fetchLatestQuotes(coinIds: string): Promise<CMCQuotesLatest> {
        const response = await fetch(`${this.baseUrl}${process.env.QUOTES}?id=${coinIds}`, { headers: this.getHeaders() });
        return this.handleResponse<CMCQuotesLatest>(response, "/quotes/latest");
    }

    async fetchHistoricalQuotes(symbol: string, start?: string, end?: string, interval: string = "1h"): Promise<CMCQuotesHistorical> {
        const url = new URL(`${this.baseUrl}${process.env.QUOTES_HISTORICAL}`);
        url.searchParams.set("symbol", symbol);
        if (start) url.searchParams.set("time_start", Math.floor(new Date(start).getTime() / 1000).toString());
        if (end) url.searchParams.set("time_end", Math.floor(new Date(end).getTime() / 1000).toString());
        url.searchParams.set("interval", interval);

        const response = await fetch(url.toString(), { headers: this.getHeaders() });
        return this.handleResponse<CMCQuotesHistorical>(response, "/quotes/historical");
    }
}

export const cmcClient = new CMCClient();
