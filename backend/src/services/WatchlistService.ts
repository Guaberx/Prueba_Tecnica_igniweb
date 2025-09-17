import AppError from "@/utils/AppError";
import prisma from "@/prisma_client";
import { CoinInfo } from "@/generated/prisma";

export async function getUserWatchlist(userId: number): Promise<CoinInfo[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError("User not found", "NOT_FOUND");
    }
    const userCoins = await prisma.userCoins.findMany({
        where: { user_id: userId },
        include: {
            coin: true
        }
    });

    return userCoins.map(item => item.coin);
}

export async function addToWatchlist(userId: number, coinIds: number[]) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError("User not found", "NOT_FOUND");
    }

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
        throw new AppError("Coin IDs array is required", "BAD_REQUEST");
    }

    // Validate all coin IDs are numbers
    if (!coinIds.every(id => typeof id === 'number' && !isNaN(id))) {
        throw new AppError("All coin IDs must be valid numbers", "BAD_REQUEST");
    }

    // Check if coins exist
    const existingCoins = await prisma.coinInfo.findMany({
        where: {
            coin_id: { in: coinIds }
        }
    });

    if (existingCoins.length !== coinIds.length) {
        throw new AppError("One or more coins not found", "NOT_FOUND");
    }

    // Check which coins are already in watchlist
    const existingWatchlist = await prisma.userCoins.findMany({
        where: {
            user_id: userId,
            coin_id: { in: coinIds }
        }
    });

    const existingCoinIds = existingWatchlist.map(item => item.coin_id);
    const newCoinIds = coinIds.filter(id => !existingCoinIds.includes(id));

    if (newCoinIds.length === 0) {
        throw new AppError("All coins are already in watchlist", "CONFLICT");
    }

    // Add new coins to watchlist
    await prisma.userCoins.createMany({
        data: newCoinIds.map(coinId => ({
            user_id: userId,
            coin_id: coinId
        })),
        skipDuplicates: true
    });

    return { success: true };
}

export async function removeFromWatchlist(userId: number, coinIds: number[]) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError("User not found", "NOT_FOUND");
    }

    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
        throw new AppError("Coin IDs array is required", "BAD_REQUEST");
    }

    // Validate all coin IDs are numbers
    if (!coinIds.every(id => typeof id === 'number' && !isNaN(id))) {
        throw new AppError("All coin IDs must be valid numbers", "BAD_REQUEST");
    }

    // Remove coins from watchlist
    const deleted = await prisma.userCoins.deleteMany({
        where: {
            user_id: userId,
            coin_id: { in: coinIds }
        }
    });

    if (deleted.count === 0) {
        throw new AppError("None of the specified coins are in watchlist", "NOT_FOUND");
    }

    return { success: true };
}

export async function updateWatchlist(userId: number, coinIds: number[]) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new AppError("User not found", "NOT_FOUND");
    }

    if (!coinIds || !Array.isArray(coinIds)) {
        throw new AppError("Coin IDs array is required", "BAD_REQUEST");
    }

    // Validate all coin IDs are numbers
    if (!coinIds.every(id => typeof id === 'number' && !isNaN(id))) {
        throw new AppError("All coin IDs must be valid numbers", "BAD_REQUEST");
    }

    // Check if coins exist
    const existingCoins = await prisma.coinInfo.findMany({
        where: {
            coin_id: { in: coinIds }
        }
    });

    if (existingCoins.length !== coinIds.length) {
        throw new AppError("One or more coins not found", "NOT_FOUND");
    }

    // Remove all existing watchlist items for this user
    await prisma.userCoins.deleteMany({
        where: {
            user_id: userId
        }
    });

    // Add new watchlist items
    if (coinIds.length > 0) {
        await prisma.userCoins.createMany({
            data: coinIds.map(coinId => ({
                user_id: userId,
                coin_id: coinId
            })),
            skipDuplicates: true
        });
    }

    return { success: true };
}
