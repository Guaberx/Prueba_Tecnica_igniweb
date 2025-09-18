import AppError from "@/utils/AppError";
import prisma from "@/prisma_client";
import { CoinInfo } from "@/generated/prisma";
import { CMCQuotesHistorical, CMCQuotesLatest } from "@/models/CMCModels";
import { cmcClient } from "@/utils/CMCClient";

interface HistoricalData {
    timestamp: string;
    price: number;
    volume_24h: number;
    volume_change_24h?: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d?: number;
    market_cap: number;
    market_cap_dominance?: number;
    fully_diluted_market_cap?: number;
    last_updated?: string;
}

interface HistoricalResponse {
    coin_id: number;
    coin: CoinInfo;
    quotes: HistoricalData[];
}

export async function searchCoins(query: string): Promise<CoinInfo[]> {
    if (!query || typeof query !== "string") {
        throw new AppError("Query parameter is required", "BAD_REQUEST");
    }

    const searchTerms = query.split(',').map(term => term.trim()).filter(term => term.length > 0);

    if (searchTerms.length === 0) {
        throw new AppError("At least one search term is required", "BAD_REQUEST");
    }

    const coins: CoinInfo[] = await prisma.coinInfo.findMany({
        where: {
            OR: [
                { symbol: { in: searchTerms } },
                { name: { in: searchTerms } },
                { slug: { in: searchTerms } }
            ]
        },
        orderBy: { name: "asc" }
    });

    return coins;
}

export async function getHistorical(identifiers: string, interval: string = "1h", start?: string, end?: string): Promise<HistoricalResponse[]> {
    if (!identifiers || typeof identifiers !== "string") {
        throw new AppError("Identifiers are required", "BAD_REQUEST");
    }

    const coinIdList = identifiers.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (coinIdList.length === 0) {
        throw new AppError("At least one valid coin ID is required", "BAD_REQUEST");
    }

    if (coinIdList.length > 10) {
        throw new AppError("Maximum 10 coin IDs allowed", "BAD_REQUEST");
    }

    const existingCoins = await prisma.coinInfo.findMany({
        where: {
            coin_id: { in: coinIdList }
        },
    });

    const existingCoinIds = existingCoins.map(coin => coin.coin_id);
    const missingCoinIds = coinIdList.filter(id => !existingCoinIds.includes(id));

    if (missingCoinIds.length > 0) {
        console.log(`Lazy loading ${missingCoinIds.length} missing coins from CMC...`);
        try {
            await lazyLoadCoins(missingCoinIds);
            const newlyLoadedCoins = await prisma.coinInfo.findMany({
                where: {
                    coin_id: { in: missingCoinIds }
                },
            });
            existingCoins.push(...newlyLoadedCoins);
        } catch (error) {
            console.warn("Failed to lazy load some coins:", error);
        }
    }

    if (existingCoins.length === 0) {
        throw new AppError("No coins found for the provided IDs", "NOT_FOUND");
    }

    const results: HistoricalResponse[] = [];

    for (const coin of existingCoins) {
        await updateLatestQuoteIfNeeded(coin.coin_id);

        let whereClause: any = { coin_id: coin.coin_id };
        if (start) whereClause.timestamp = { gte: new Date(start) };
        if (end) whereClause.timestamp = { ...whereClause.timestamp, lte: new Date(end) };

        const existing = await prisma.coinQuotes.findMany({
            where: whereClause,
            orderBy: { timestamp: "asc" },
        });

        let quotes: HistoricalData[];

        if (existing.length > 0) {
            quotes = existing.map(q => ({
                timestamp: q.timestamp.toISOString(),
                price: parseFloat(q.price.toString()),
                volume_24h: parseFloat(q.volume_24h?.toString() || '0'),
                volume_change_24h: q.volume_change_24h ? parseFloat(q.volume_change_24h.toString()) : undefined,
                percent_change_1h: parseFloat(q.percent_change_1h.toString()),
                percent_change_24h: parseFloat(q.percent_change_24h.toString()),
                percent_change_7d: parseFloat(q.percent_change_7d.toString()),
                percent_change_30d: q.percent_change_30d ? parseFloat(q.percent_change_30d.toString()) : undefined,
                market_cap: parseFloat(q.market_cap.toString()),
                market_cap_dominance: q.market_cap_dominance ? parseFloat(q.market_cap_dominance.toString()) : undefined,
                fully_diluted_market_cap: q.fully_diluted_market_cap ? parseFloat(q.fully_diluted_market_cap.toString()) : undefined,
                last_updated: q.last_updated?.toISOString(),
            }));
        } else {
            const data = await cmcClient.fetchHistoricalQuotes(coin.symbol, start, end, interval);
            const coinData = data.data;

            if (!coinData || !coinData.quotes || coinData.quotes.length === 0) {
                console.warn(`No historical quotes found for ${coin.symbol}`);
                continue;
            }

            const cmcQuotes = coinData.quotes;

            await prisma.coinQuotes.createMany({
                data: cmcQuotes.map((q, index) => ({
                    coin_id: coin.coin_id,
                    price: q.quote.USD.price,
                    volume_24h: q.quote.USD.volume_24h,
                    volume_change_24h: null,
                    percent_change_1h: 0,
                    percent_change_24h: 0,
                    percent_change_7d: 0,
                    percent_change_30d: null,
                    market_cap: q.quote.USD.market_cap,
                    market_cap_dominance: null,
                    fully_diluted_market_cap: null,
                    last_updated: new Date(q.quote.USD.timestamp),
                    timestamp: new Date(new Date(q.timestamp).getTime() + index),
                })),
                skipDuplicates: true,
            });

            quotes = cmcQuotes.map((q) => ({
                timestamp: q.timestamp,
                price: q.quote.USD.price,
                volume_24h: q.quote.USD.volume_24h,
                volume_change_24h: undefined,
                percent_change_1h: 0,
                percent_change_24h: 0,
                percent_change_7d: 0,
                percent_change_30d: undefined,
                market_cap: q.quote.USD.market_cap,
                market_cap_dominance: undefined,
                fully_diluted_market_cap: undefined,
                last_updated: q.quote.USD.timestamp,
            }));
        }

        results.push({
            coin_id: coin.coin_id,
            coin: {
                coin_id: coin.coin_id,
                symbol: coin.symbol,
                name: coin.name,
                slug: coin.slug,
                rank: coin.rank,
                logo: coin.logo,
                description: coin.description,
                website: coin.website,
                category: coin.category
            },
            quotes
        });
    }

    if (results.length === 0) {
        throw new AppError("No historical data found for any of the requested coins", "NOT_FOUND");
    }

    return results;
}


export async function getLatestByIds(ids: string): Promise<CMCQuotesLatest> {
    if (!ids || typeof ids !== "string") {
        throw new AppError("Coin IDs are required", "BAD_REQUEST");
    }

    return cmcClient.fetchLatestQuotes(ids);
}

export async function getCoinsByRank(start: number = 0, limit: number = 50): Promise<CoinInfo[]> {
    if (start < 0) {
        throw new AppError("Start parameter must be non-negative", "BAD_REQUEST");
    }

    if (limit <= 0 || limit > 1000) {
        throw new AppError("Limit parameter must be between 1 and 1000", "BAD_REQUEST");
    }

    const coins = await prisma.coinInfo.findMany({
        where: {
            rank: { not: null }
        },
        orderBy: {
            rank: "asc"
        },
        skip: start,
        take: limit
    });

    return coins;
}

async function updateLatestQuoteIfNeeded(coinId: number): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const latestQuote = await prisma.coinQuotes.findFirst({
        where: { coin_id: coinId },
        orderBy: { timestamp: "desc" }
    });

    if (!latestQuote || latestQuote.timestamp < oneHourAgo) {
        console.log(`Updating latest quote for coin ${coinId} (last update: ${latestQuote?.timestamp || 'never'})`);

        try {
            const data = await cmcClient.fetchLatestQuotes(coinId.toString());
            const coinData = data.data[coinId.toString()];

            if (!coinData) {
                console.warn(`No quote data found for coin ${coinId}`);
                return;
            }

            const quote = coinData.quote.USD;
            const now = new Date();

            await prisma.coinQuotes.create({
                data: {
                    coin_id: coinId,
                    price: quote.price,
                    volume_24h: quote.volume_24h,
                    volume_change_24h: quote.volume_change_24h,
                    percent_change_1h: quote.percent_change_1h,
                    percent_change_24h: quote.percent_change_24h,
                    percent_change_7d: quote.percent_change_7d,
                    percent_change_30d: quote.percent_change_30d,
                    market_cap: quote.market_cap,
                    market_cap_dominance: quote.market_cap_dominance,
                    fully_diluted_market_cap: quote.fully_diluted_market_cap,
                    last_updated: new Date(quote.last_updated),
                    timestamp: now,
                }
            });

            console.log(`Updated latest quote for coin ${coinId}`);
        } catch (error) {
            console.warn(`Error updating latest quote for coin ${coinId}:`, error);
        }
    }
}

async function lazyLoadCoins(coinIds: number[]): Promise<void> {
    if (coinIds.length === 0) {
        return;
    }

    const coinIdsString = coinIds;
    const data = await cmcClient.fetchInfo(coinIdsString);
    const infoRecords = Object.values(data.data || {});

    if (infoRecords.length === 0) {
        throw new AppError("No coin info found in CMC response", "NOT_FOUND");
    }

    await prisma.$transaction(
        infoRecords.map((info: any) => {
            const website = Array.isArray(info.urls.website)
                ? info.urls.website[0]
                : info.urls.website;

            return prisma.coinInfo.upsert({
                where: { coin_id: info.id },
                update: {
                    logo: info.logo,
                    description: info.description,
                    website: website,
                    category: info.category,
                },
                create: {
                    coin_id: info.id,
                    symbol: info.symbol,
                    name: info.name,
                    slug: info.slug,
                    logo: info.logo,
                    description: info.description,
                    website: website,
                    category: info.category,
                }
            });
        })
    );

    console.log(`Lazy loaded ${infoRecords.length} coins from CMC /info`);
}
