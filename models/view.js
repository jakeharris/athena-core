'use strict';
module.exports = function(sequelize, DataTypes) {
  var View = sequelize.define('View', {
    UserId: DataTypes.BIGINT.UNSIGNED
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        View.belongsTo(models.Post)
      }
    }
  });
  return View;
};