module.exports = function(sequelize, Sequelize) {
 
    var dailyTradeLog = sequelize.define('daily_trade_log',{
        pair_id:Sequelize.TINYINT,
        date_traded:Sequelize.DATE,
        low:Sequelize.DECIMAL(50,8),
        high:Sequelize.DECIMAL(50,8),
        first_open:Sequelize.DECIMAL(50,8),
        last_close:Sequelize.DECIMAL(50,8),
        volume:Sequelize.DECIMAL(50,8),
        created_at:Sequelize.DATE
    }, {
        timestamps: false,
        paranoid: true,
        underscored: true,
        // freezeTableName: true,
        tableName: 'daily_trade_log',
        operatorsAliases: false
    });

    return dailyTradeLog;
}