module.exports = (sequelize, DataTypes) => {
    const Resident = sequelize.define('resident', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        company: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        }
    }, {
        timestamps: false
    });
    return Resident;
}