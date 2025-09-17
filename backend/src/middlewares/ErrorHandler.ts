import express, { type Request, type Response, type NextFunction } from "express";
import AppError, { type ErrorType } from '@/utils/AppError';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        const statusCode = err.getHttpStatusCode();
        res.status(statusCode).json({ message: err.message });
    } else {
        res.status(500).json({ message: 'Unexpected error', error: err.message });
    }
};

export default errorHandler;
