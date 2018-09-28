module.exports = function(sequelize, Sequelize) {
 
    var currencyMaster = sequelize.define('currency_master',{}, {
 
        timestamps: false,
        paranoid: true,
        underscored: true,
        // freezeTableName: true,
        tableName: 'currency_master',
    });
 
    return currencyMaster;
  
}