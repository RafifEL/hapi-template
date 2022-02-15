'use strict';
const tableName = 'users';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      fullname: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      details: {
        type: Sequelize.JSONB,
      },
      created_at: {
        defaultValue: Sequelize.fn('now'),
        type: Sequelize.DATE,
      },
      updated_at: {
        defaultValue: Sequelize.fn('now'),
        type: Sequelize.DATE,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};
