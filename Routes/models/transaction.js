module.exports = function(sequelize, Sequelize) {
 
    var Transaction = sequelize.define('transaction',{}, {
 
        timestamps: false,
        paranoid: true,
        underscored: true,
        // freezeTableName: true,
        tableName: 'transaction',
    });

    // console.log(Transaction);
 
    return Transaction;
  
}