const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log("Prisma Client disconnected.");
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log("Prisma Client disconnected.");
  process.exit(0);
});

module.exports = prisma;
