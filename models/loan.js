'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      Loan.belongsTo(models.User, { foreignKey: 'user_id' });
      Loan.belongsTo(models.Book, { foreignKey: 'book_id' });
    }
  }

  Loan.init({
    user_id: DataTypes.INTEGER,
    book_id: DataTypes.INTEGER,
    borrow_date: DataTypes.DATE,
    return_date: DataTypes.DATE,
    returned: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Loan',
  });

  return Loan;
};
