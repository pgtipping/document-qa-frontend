import { PrismaClient } from "@prisma/client";
// Initialize Prisma Client
// Use the global instance if it exists, otherwise create a new one.
// This prevents creating multiple instances during hot reloading in development.
const prisma = global.prisma ||
    new PrismaClient({
    // Optional: Add logging configuration if needed
    // log: ['query', 'info', 'warn', 'error'],
    });
// In development, assign the new instance to the global variable
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
export default prisma;
