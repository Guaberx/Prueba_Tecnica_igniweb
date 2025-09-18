// test-db-connection.js
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database.');
    // Optionally, perform a simple query to further verify
    // const users = await prisma.user.findMany();
    // console.log('Successfully queried data:', users);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Exit with an error code
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();