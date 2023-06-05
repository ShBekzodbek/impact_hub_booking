//importing modules
const { Sequelize, DataTypes } = require('sequelize');

require('dotenv').config();


const sequelize = new Sequelize(process.env.db, process.env.user, process.env.password, {
    host: process.env.host,
    dialect: process.env.dialect,
    port: process.env.db_port,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});



const check = () => {
    sequelize.authenticate().then(() => {
        console.log(`Database connected to discover`);
    }).catch((err) => {
        console.log(err);
        return;
    });
}

const syncDB = (val) => {
    sequelize.sync()
        .then((result) => {
            console.log('Database has been synced...');
        }).catch((err) => {
            console.log(`There is Error while syncing database...${err}`);
            return;
        });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.check = check;
db.syncDB = syncDB;

//connecting to model
db.room = require('./room')(sequelize, DataTypes);
db.book = require('./book')(sequelize, DataTypes);
db.resident = require('./resident')(sequelize, DataTypes);




// Relations 

db.resident.hasMany(db.book);
db.book.belongsTo(db.resident);

db.room.hasMany(db.book);
db.book.belongsTo(db.room);

module.exports = db;