import { Sequelize } from 'sequelize';
import Config from '../../config/dbConfig';
import { User } from './user';
const env =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const DBConfig = Config[env];
const DBSequelize = new Sequelize(
  DBConfig.database as string,
  DBConfig.username as string,
  DBConfig.password as string,
  DBConfig
);

const models = {
  User,
};

Object.values(models).map(model => model.initModel(DBSequelize));

Object.values(models).map(model => model.associateModel(DBSequelize));

const DB = { DBSequelize, Model: models };

export { DB };
