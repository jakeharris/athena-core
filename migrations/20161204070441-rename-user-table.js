'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameTable('Users', 'Views')
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameTable('Views', 'Users')
  }
};
