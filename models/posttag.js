'use strict';
module.exports = function(sequelize, DataTypes) {
  var PostTag = sequelize.define('PostTag', {
    
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        PostTag.belongsTo(models.Post)
        PostTag.belongsTo(models.Tag)
      }
    }
  });
  return PostTag;
};