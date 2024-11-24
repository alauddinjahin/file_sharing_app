const { PrismaClient } = require('@prisma/client');
const { format } = require('date-fns');

class PrismaService {

  constructor() {
    this._prisma = new PrismaClient({
      // log: ['query'], 
    });
    this.#setupMiddleware();
    this.#setupShutdownHooks();

    this._prisma.$on('query', (e) => {
      console.log('Query:', e.query);
      console.log('Duration:', e.duration, 'ms');
    });
  }

  #setupMiddleware() {
    this._prisma.$use(async (params, next) => {
      
      const { action }=params;
      const listToIgnore = [
        'create',
        'createMany',
        'update',
        'updateMany',
        'upsert',
        'delete',
        'deleteMany',
        'increment',
        'decrement',
        'set',
      ];

      if (!listToIgnore.includes(action)) {

        const result = await next(params);
        if (Array.isArray(result)) {
          return result.map(item => this.#formatDateFields(item));
        } 
        else {
          return this.#formatDateFields(result);
        }
      }

      return next(params);
    });
  }

  // Private method to format date fields
  #formatDateFields(item) {

    if(!item) return item;

    const dateFormatToConvert = 'yyyy-MM-dd HH:mm:ss';
    if (item?.createdAt) {
      item.createdAt = format(new Date(item.createdAt), dateFormatToConvert);
    }

    if (item?.updatedAt) {
      item.updatedAt = format(new Date(item.updatedAt), dateFormatToConvert);
    }

    return item;
  }

  // Private method to setup graceful shutdown for Prisma Client
  #setupShutdownHooks() {
    // Handle SIGINT and SIGTERM signals to gracefully disconnect Prisma client
    process.on('SIGINT', async () => {
      await this._prisma.$disconnect();
      console.log("Prisma Client disconnected.");
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this._prisma.$disconnect();
      console.log("Prisma Client disconnected.");
      process.exit(0);
    });
  }

  // Public method to access Prisma client
  getClient() {
    return this._prisma;
  }
}

module.exports = new PrismaService();
