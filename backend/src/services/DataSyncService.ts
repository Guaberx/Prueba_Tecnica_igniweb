import AppError from "@/utils/AppError";
import prisma from "@/prisma_client";
import { CMCMapResponse, CMCInfoResponse } from "@/models/CMCModels";
import { cmcClient } from "@/utils/CMCClient";
import cron from "node-cron";

interface SyncResult {
    coinsProcessed: number;
    infoProcessed: number;
    mapSkipped: boolean;
    infoSkipped: boolean;
}

interface SyncStats {
    totalCoins: number;
    coinsWithInfo: number;
    lastSyncDate: Date | null;
}

async function shouldSkipUpdate(source: string): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const lastUpdate = await prisma.updateLog.findUnique({
        where: { source }
    });

    if (!lastUpdate) {
        return false;
    }

    return lastUpdate.updatedAt > twentyFourHoursAgo;
}

async function updateLog(source: string): Promise<void> {
    await prisma.updateLog.upsert({
        where: { source },
        update: { updatedAt: new Date() },
        create: { source, updatedAt: new Date() }
    });
}

export async function syncCoinData(): Promise<SyncResult> {
    try {
        console.log("Starting coin data sync...");

        let coinsProcessed = 0;
        let infoProcessed = 0;
        let mapSkipped = false;
        let infoSkipped = false;

        // Step 1: Check if we should fetch from /map endpoint
        console.log("Checking if map data needs update...");
        const shouldSkipMap = await shouldSkipUpdate("map");
        let mapData: CMCMapResponse | null = null;

        if (shouldSkipMap) {
            console.log("Skipping /map fetch - data updated less than 24 hours ago");
            mapSkipped = true;
        } else {
            console.log("Fetching data from /map endpoint...");
            try {
                mapData = await fetchMapData();
                console.log(`Fetched ${mapData.data.length} coins from /map`);

                console.log("Updating map log...");
                await updateLog("map");
            } catch (error) {
                console.error("Failed to fetch map data:", error);
                throw new AppError(`Map data fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "INTERNAL_ERROR");
            }
        }

        // Step 2: Store/update basic coin info in database (if we fetched new data)
        if (mapData) {
            console.log("Storing map data in database...");
            try {
                coinsProcessed = await storeMapData(mapData);
                console.log(`Stored ${coinsProcessed} coins in database`);
            } catch (error) {
                console.error("Failed to store map data:", error);
                throw new AppError(`Database storage failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "INTERNAL_ERROR");
            }
        }

        // Step 3: Check if we should fetch from /info endpoint
        console.log("Checking if info data needs update...");
        const shouldSkipInfo = await shouldSkipUpdate("info");

        if (shouldSkipInfo) {
            console.log("Skipping /info fetch - data updated less than 24 hours ago");
            infoSkipped = true;
        } else {
            console.log("Preparing to fetch info data...");
            let coinIds: string;

            if (mapData) {
                coinIds = mapData.data.map(coin => coin.id).join(',');
                console.log(`Using ${mapData.data.length} coin IDs from fresh map data`);
            } else {
                console.log("Fetching existing coin IDs from database...");
                const existingCoins = await prisma.coinInfo.findMany({
                    select: { coin_id: true }
                });
                coinIds = existingCoins.map(coin => coin.coin_id).join(',');
                console.log(`Found ${existingCoins.length} existing coins in database`);
            }

            if (!coinIds) {
                console.log("No coin IDs available for /info fetch - skipping");
            } else {
                console.log(`Fetching detailed info for ${coinIds.split(',').length} coins...`);
                try {
                    const infoData = await fetchInfoDataByIds(coinIds);
                    console.log(`Fetched detailed info for ${Object.keys(infoData.data).length} coins from /info`);

                    console.log("Storing info data in database...");
                    infoProcessed = await storeInfoData(infoData);
                    console.log(`Stored ${infoProcessed} info records in database`);

                    console.log("Updating info log...");
                    await updateLog("info");
                } catch (error) {
                    console.error("Failed to fetch/store info data:", error);
                    throw new AppError(`Info data operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "INTERNAL_ERROR");
                }
            }
        }

        console.log(`Coin data sync completed successfully. Processed ${coinsProcessed} coins and ${infoProcessed} info records.`);

        return { coinsProcessed, infoProcessed, mapSkipped, infoSkipped };
    } catch (error) {
        console.error("Error during coin data sync:", error);

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(`Failed to sync coin data: ${error instanceof Error ? error.message : 'Unknown error'}`, "INTERNAL_ERROR");
    }
}

async function fetchMapData(): Promise<CMCMapResponse> {
    return cmcClient.fetchMap();
}

async function fetchInfoDataByIds(coinIds: string): Promise<CMCInfoResponse> {
    return cmcClient.fetchInfo(coinIds);
}

async function storeMapData(mapData: CMCMapResponse): Promise<number> {
    const coinsToUpsert = mapData.data.map((coin) => ({
        coin_id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        slug: coin.slug,
        rank: coin.rank,
    }));

    await prisma.$transaction(
        coinsToUpsert.map(coin =>
            prisma.coinInfo.upsert({
                where: { coin_id: coin.coin_id },
                update: {
                    symbol: coin.symbol,
                    name: coin.name,
                    slug: coin.slug,
                    rank: coin.rank,
                },
                create: coin
            })
        )
    );

    return coinsToUpsert.length;
}

async function storeInfoData(infoData: CMCInfoResponse): Promise<number> {
    const infoRecords = Object.values(infoData.data);

    if (infoRecords.length === 0) {
        return 0;
    }

    await prisma.$transaction(
        infoRecords.map(info => {
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

    return infoRecords.length;
}

export async function getSyncStats(): Promise<SyncStats> {
    const totalCoins = await prisma.coinInfo.count();
    const coinsWithInfo = await prisma.coinInfo.count({
        where: {
            description: { not: null }
        }
    });

    const lastSyncDate = null;

    return {
        totalCoins,
        coinsWithInfo,
        lastSyncDate
    };
}

export async function getNextSyncTime(): Promise<Date> {
    const mapUpdate = await prisma.updateLog.findUnique({
        where: { source: "map" }
    });

    const infoUpdate = await prisma.updateLog.findUnique({
        where: { source: "info" }
    });

    const lastUpdate = mapUpdate && infoUpdate
        ? (mapUpdate.updatedAt > infoUpdate.updatedAt ? mapUpdate.updatedAt : infoUpdate.updatedAt)
        : (mapUpdate?.updatedAt || infoUpdate?.updatedAt || new Date());

    const nextSyncTime = new Date(lastUpdate.getTime() + 24 * 60 * 60 * 1000);
    return nextSyncTime;
}

export async function scheduleNextSync(): Promise<void> {
    const nextSyncTime = await getNextSyncTime();
    const now = new Date();
    const delayMs = nextSyncTime.getTime() - now.getTime();

    if (delayMs <= 0) {
        console.log("Next sync is due now, running immediately...");
        await runScheduledSync();
        return;
    }

    const delayHours = Math.round(delayMs / (1000 * 60 * 60) * 10) / 10;
    console.log(`Next sync scheduled in ${delayHours} hours (${nextSyncTime.toISOString()})`);

    setTimeout(async () => {
        await runScheduledSync();
    }, delayMs);
}

export async function runScheduledSync(): Promise<void> {
    try {
        console.log("Running scheduled coin data sync...");
        const result = await syncCoinData();
        console.log(`Scheduled sync completed: ${result.coinsProcessed} coins, ${result.infoProcessed} info records`);

        await scheduleNextSync();
    } catch (error) {
        console.error("Scheduled sync failed:", error);
        setTimeout(() => scheduleNextSync(), 60 * 60 * 1000);
    }
}

export async function startSyncScheduler(): Promise<void> {
    console.log("Starting coin data sync scheduler...");

    try {
        await runScheduledSync();
    } catch (error) {
        console.error("Failed to start sync scheduler:", error);
    }

    cron.schedule("0 0 * * *", async () => {
        console.log("Running daily coin data sync...");
        try {
            const result = await syncCoinData();
            console.log(`Daily sync completed: ${result.coinsProcessed} coins, ${result.infoProcessed} info records`);
        } catch (error) {
            console.error("Daily sync failed:", error);
        }
    });

    console.log("Coin data sync scheduler started - will run daily at midnight");
}
