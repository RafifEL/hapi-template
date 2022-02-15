import { config } from 'dotenv';
import { Options } from 'sequelize';
config();

const defaultDBconfig = {
  logging: false,
  pool: {
    max: 15,
    min: 0,
    idle: 10000,
    acquire: 10000,
  },
  define: {
    underscored: true,
  },
};

const Config: Record<string, Options> = {
  development: {
    username: process.env.DB_DEV_USERNAME || 'development',
    database: process.env.DB_DEV_DATABASE || 'gateball',
    password: process.env.DB_DEV_PASS || 'password',
    host: process.env.DB_DEV_HOST || 'localhost',
    port: process.env.DB_DEV_PORT ? Number(process.env.DB_DEV_PORT) : 5432,
    dialect: 'postgres',
    ...defaultDBconfig, // REPLACE THE DEFAULT IF NEEDED
  },
  production: {
    username: process.env.DB_PRD_USERNAME || 'development',
    database: process.env.DB_PRD_DATABASE || 'gateball',
    password: process.env.DB_PRD_PASS || 'password',
    host: process.env.DB_PRD_HOST || 'localhost',
    port: process.env.DB_PRD_PORT ? Number(process.env.DB_PRD_PORT) : 5432,
    dialect: 'postgres',
    ...defaultDBconfig, // REPLACE THE DEFAULT IF NEEDED
  },
};

export default Config;
