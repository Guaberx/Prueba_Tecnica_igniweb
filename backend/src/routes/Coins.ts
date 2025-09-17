import express, { type Request, type Response, type NextFunction } from "express";
import { searchCoins, getHistorical, getLatestByIds, getCoinsByRank } from "@/services/CoinService";
import AppError from "@/utils/AppError";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { query } = req.query;
        const result = await searchCoins(query as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get("/historical", async (req, res, next) => {
    try {
        const { identifiers, interval = "1h", start, end } = req.query;
        const result = await getHistorical(identifiers as string, interval as string, start as string, end as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/latest', async (req, res, next) => {
    try {
        const { ids } = req.query;
        const result = await getLatestByIds(ids as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/rank', async (req, res, next) => {
    try {
        const start = parseInt(req.query.start as string) || 0;
        const limit = parseInt(req.query.limit as string) || 50;
        const result = await getCoinsByRank(start, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});



export default router;
