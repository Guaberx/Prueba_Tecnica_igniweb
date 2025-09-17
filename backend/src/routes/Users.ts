import express, { type Request, type Response, type NextFunction } from "express";
import { createUser } from "@/services/UserService";

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const result = await createUser(username, password, email);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
});

export default router;
