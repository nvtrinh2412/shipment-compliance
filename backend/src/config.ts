export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://safiri_user:safiri_password@localhost:5433/safiri_db?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  }
};
