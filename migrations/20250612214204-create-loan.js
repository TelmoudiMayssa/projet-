'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Loans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Books', key: 'id' },
        onDelete: 'CASCADE'
      },      
      borrow_date: {
        type: Sequelize.DATE
      },
      return_date: {
        type: Sequelize.DATE
      },
      returned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Loans');
  }
};