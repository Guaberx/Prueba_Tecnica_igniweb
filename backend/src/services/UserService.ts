import AppError from "@/utils/AppError";
import prisma from "@/prisma_client";
import { User } from "@/generated/prisma";

interface CreateUserResponse {
    message: string;
    id: number;
}

export async function createUser(username: string, password: string, email: string): Promise<CreateUserResponse> {
    if (!username || !password || !email) {
        throw new AppError("Username, password, and email are required", "BAD_REQUEST");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });

    if (existingUser) {
        throw new AppError("User already exists", "CONFLICT");
    }

    // In a real app, hash the password
    const user = await prisma.user.create({
        data: {
            username,
            password, // Should be hashed
            email
        }
    });

    return { message: 'User created', id: user.id };
}
