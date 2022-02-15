import { hashSync } from 'bcrypt';
import { DataTypes, Model, Sequelize } from 'sequelize';

export type Role = 'superadmin' | 'admin' | 'viewer';
export interface UserDetails {
  roles: Role[];
}

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  details: UserDetails;
}

export class User extends Model implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public fullname!: string;
  public password!: string;
  public details!: UserDetails;

  static initModel(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: 'id',
        },
        username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        fullname: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          set(value: string | Buffer) {
            this.setDataValue('password', hashSync(value, 10));
          },
        },
        details: {
          type: DataTypes.JSONB,
        },
      },
      {
        sequelize,
        modelName: 'user',
        tableName: 'users',
        underscored: true,
      }
    );
  }

  static associateModel(sequelize: Sequelize): void {}
}
