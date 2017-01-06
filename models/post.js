'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    url: DataTypes.TEXT
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Post.hasMany(models.View)
        Post.belongsToMany(models.Tag, {through: 'PostTag', timestamps: false})
      }
    }
  });
  return Post;
};