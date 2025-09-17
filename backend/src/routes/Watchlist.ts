import express, { type Request, type Response, type NextFunction } from "express";
import { getUserWatchlist, addToWatchlist, removeFromWatchlist, updateWatchlist } from "@/services/WatchlistService";
import AppError from "@/utils/AppError";

const router = express.Router();

router.get('/:userId', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            throw new AppError("Invalid user ID", "BAD_REQUEST");
        }
        const result = await getUserWatchlist(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/:userId', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const { coinIds } = req.body;

        if (isNaN(userId)) {
            throw new AppError("Invalid user ID", "BAD_REQUEST");
        }

        if (!coinIds || !Array.isArray(coinIds)) {
            throw new AppError("Coin IDs must be an array of numbers", "BAD_REQUEST");
        }

        const result = await addToWatchlist(userId, coinIds);
        res.json(result);
    } catch (error) {
        next(error);
    }
});



router.put('/:userId', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const { coinIds } = req.body;

        if (isNaN(userId)) {
            throw new AppError("Invalid user ID", "BAD_REQUEST");
        }

        if (!coinIds || !Array.isArray(coinIds)) {
            throw new AppError("Coin IDs must be an array of numbers", "BAD_REQUEST");
        }

        const result = await updateWatchlist(userId, coinIds);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/:userId', async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId);
        const { coinIds } = req.body;

        if (isNaN(userId)) {
            throw new AppError("Invalid user ID", "BAD_REQUEST");
        }

        if (!coinIds || !Array.isArray(coinIds)) {
            throw new AppError("Coin IDs must be an array of numbers", "BAD_REQUEST");
        }

        const result = await removeFromWatchlist(userId, coinIds);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
