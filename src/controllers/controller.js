const db = require('../models/index');

const moment = require('moment');

const BookingController = {
    search:
        async (req, res, next) => {
            try {
                const { name, type, page, page_size } = req.query;
                let offset = (page - 1) * page_size;
                let limit = page_size;
                let options = { where: {} };
                if (typeof name != "undefined") {
                    options.where.name = {
                        [db.Sequelize.Op.iLike]: `%${name}%`
                    }
                }
                if (typeof type != "undefined") {
                    options.where.type = {
                        [db.Sequelize.Op.iLike]: `%${type}%`
                    }
                }
                if (typeof page != "undefined" && !isNaN(Number(page)) && page > 0) {
                    offset = (page - 1) * page_size;
                    options.offset = offset;
                }
                if (typeof page_size != "undefined" && !isNaN(Number(page_size))) {
                    limit = page_size;
                    options.limit = limit;
                }
                const rooms = await db.room.findAndCountAll(options);
                return res.status(200).send(rooms);
            } catch (err) {
                next(err);
            }
        },
    getARoom:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                let data = {};
                let room = await db.room.findOne({
                    where: {
                        id
                    },
                    attributes: ['name', 'type', 'capacity'],
                    include: db.book
                });
                if (!room) {
                    return res.status(404).send({ message: 'Room not found' });
                }
                let books = room.books.map(e => {
                    let newE = {};
                    newE.id = e.id;
                    newE.start = moment(e.start).format("LLL");
                    newE.end = moment(e.end).format("LLL");
                    return newE;
                });
                data.name = room.name;
                data.type = room.type;
                data.capacity = room.capacity;
                data.books = books;
                return res.status(200).send({ data });
            } catch (err) {
                next(err);
            }
        },
    checkAvailability:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                let now = new Date();
                now.setHours(24);
                const start_date = req.body.start_date ? new Date(req.body.start_date) : Date.now();
                const end_date = req.body.end_date ? new Date(req.body.end_date) : now;
                if (!id || typeof id == "undefined") {
                    return res.status(400).send('Invalid dates');
                }
                const validRoomId = await db.room.findOne({
                    where: {
                        id
                    }
                });
                if (!validRoomId) {
                    return res.status(404).send({ message: 'Room not found' });
                }
                if (isNaN(start_date) || isNaN(end_date) || start_date >= end_date) {
                    return res.status(400).send('Invalid dates');
                }
                const isFree = await db.book.findOne({
                    where: {
                        roomId: id,
                        [db.Sequelize.Op.and]: {
                            start: {
                                [db.Sequelize.Op.lt]: end_date
                            },
                            end: {
                                [db.Sequelize.Op.gt]: start_date
                            }
                        }
                    }
                });
                if (isFree) {
                    return res.status(400).send({
                        message: 'Room is already booked'
                    });
                }
                return res.status(200).send({
                    message: 'Room is available'
                })
            } catch (err) {
                next(err);
            }
        },

    bookARoom:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                const start_date = new Date(req.body.start_date);
                const end_date = new Date(req.body.end_date);
                if (!id || typeof id == "undefined") {
                    return res.status(400).send('Invalid dates');
                }
                const validRoomId = await db.room.findOne({
                    where: {
                        id
                    }
                });
                if (!validRoomId) {
                    return res.status(404).send({ message: 'Room not found' });
                }
                if (isNaN(start_date) || isNaN(end_date) || start_date >= end_date) {
                    return res.status(400).send('Invalid dates');
                }
                const isFree = await db.book.findOne({
                    where: {
                        roomId: id,
                        [db.Sequelize.Op.and]: {
                            start: {
                                [db.Sequelize.Op.lt]: end_date
                            },
                            end: {
                                [db.Sequelize.Op.gt]: start_date
                            }
                        }
                    }
                });
                if (isFree) {
                    return res.status(400).send({
                        message: 'Room is already booked'
                    });
                }
                let resident;
                const isOldresident = await db.resident.findOne({
                    where: {
                        name: req.body.resident.name
                    }
                });
                resident =
                    isOldresident ?
                        isOldresident :
                        await db.resident.create({
                            name: req.body.resident.name,
                            phone: req.body.resident.phone || "",
                            email: req.body.resident.email || "",
                        });
                const newBook = await resident.createBook({
                    roomId: id,
                    start: start_date,
                    end: end_date
                });
                await resident.save();
                await newBook.save();
                return res.status(200).send({
                    "message": "xona muvaffaqiyatli band qilindi"
                });
            } catch (err) {
                next(err);
            }
        }
}

module.exports = BookingController;