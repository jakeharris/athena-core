'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Post.hasMany(models.View)
        Post.hasMany(models.Tag)
      }
    }
  });
  return Post;
};