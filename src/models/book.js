module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define('book', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        start: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },{
        timestamps: false
    });
    return Book;
}