module.exports = function(sequelize, Sequelize) {
 
    var User = sequelize.define('user',{}, {
 
        timestamps: false,
        paranoid: true,
        underscored: true,
        // freezeTableName: true,
        tableName: 'user',
    });

    console.log(User);
 
    return User;
 
}