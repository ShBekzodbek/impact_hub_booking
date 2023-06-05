module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('room', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
    });
    return Room;
}