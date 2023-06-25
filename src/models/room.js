module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('room', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNul: false
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false
    });
    return Room;
}