import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import coinsRouter from "@/routes/Coins";
import usersRouter from "@/routes/Users";
import watchlistRouter from "@/routes/Watchlist";
import ErrorHandlerMiddleware from "@/middlewares/ErrorHandler";
import cors from "cors";

import prisma from "@/prisma_client";
import { startSyncScheduler } from "@/services/DataSyncService";

dotenv.config();
const app = express();
app.use(express.json());
// For development so it add localhost routes to the allowed origin
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true, // if you need to send cookies/auth headers
}));

const PORT = process.env.PORT || 6000;

app.get("/", (request: Request, response: Response) => {
    response.status(200).json({ message: "Hello World" });
});

app.use("/coins", coinsRouter);
app.use("/users", usersRouter);
app.use("/watchlist", watchlistRouter);
app.use(ErrorHandlerMiddleware)

app.listen(PORT, async () => {
    console.log("Server running at PORT: ", PORT);

    try {
        await startSyncScheduler();
    } catch (error) {
        console.error("Failed to start sync scheduler:", error);
    }
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});

// Start server
// if (import.meta.url === `file://${process.argv[1]}`) {
//     const port = process.env.PORT || 3002;
//     app.listen(port, () => {
//         console.log(`Server running on port ${port}`);
//         console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
//     });
// }
