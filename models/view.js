'use strict';
module.exports = function(sequelize, DataTypes) {
  var View = sequelize.define('View', {
    userID: DataTypes.BIGINT.UNSIGNED
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        View.belongsTo(models.Post)
      }
    }
  });
  return View;
};