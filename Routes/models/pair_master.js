module.exports = function(sequelize, Sequelize) {
 
    var pairMaster = sequelize.define('pair_master',{}, {
 
        timestamps: false,
        paranoid: true,
        underscored: true,
        // freezeTableName: true,
        tableName: 'pair_master',
    });
 
    return pairMaster;
  
}