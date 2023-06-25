const db = require('../models/index');

const { Op } = require("sequelize");

const moment = require('moment');

const { formatter, correctDate, makeIt } = require('../utils/formatDate');


const BookingController = {
    search:
        async (req, res, next) => {
            try {
                let { search, type, page, page_size } = req.query;
                page = parseInt(page);
                page_size = parseInt(page_size);
                let offset = (page - 1) * page_size;
                let limit = page_size;
                let options = { where: {} };
                if (typeof search != "undefined") {
                    options.where.name = search;
                }
                if (typeof type != "undefined") {
                    options.where.type = type;
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
                return res.status(200).send({
                    page: page || 1,
                    count: rooms["rows"].length,
                    page_size: page_size || rooms["rows"].length,
                    results: rooms["rows"]
                });
            } catch (err) {
                next(err);
            }
        },
    getARoom:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                let room = await db.room.findOne({
                    where: {
                        id: id
                    },
                    attributes: ['id', 'name', 'type', 'capacity'],
                });
                if (!room) {
                    return res.status(404).send({ error: 'topilmadi' });
                }
                return res.status(200).send(room);
            } catch (err) {
                next(err);
            }
        },
    checkAvailability:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                const validRoomId = await db.room.findOne({
                    where: {
                        id
                    },
                });
                if (!validRoomId) {
                    return res.status(404).send({ error: 'topilmadi' });
                }
                let givenDate = req.query.date ? new Date(formatter(req.query.date)) : new Date();
                let thatDay = correctDate(givenDate, 0);
                let tomorrow = correctDate(givenDate, 1);
                const bookedTimes = await db.book.findAll({
                    where: {
                        roomId: id,
                        start: {
                            [Op.gte]: givenDate,
                        },
                        end: {
                            [Op.lte]: tomorrow
                        }
                    },
                });
                let formatBooks = bookedTimes.map(e => {
                    let ans = {};
                    let start = new Date(e.start).toLocaleDateString() + " " + new Date(e.start).toLocaleTimeString('en-US', { hour12: false });
                    let end = new Date(e.end).toLocaleDateString() + " " + new Date(e.end).toLocaleTimeString('en-US', { hour12: false });
                    ans.start = start.replaceAll('/', '-');
                    ans.end = end.replaceAll('/', '-');
                    ans.hint = new Date(e.start).toLocaleTimeString('en-US', { hour12: false }) + " " + new Date(e.end).toLocaleTimeString('en-US', { hour12: false });
                    return ans;
                });
                let ans = [], startTime = (thatDay.toLocaleDateString() + "").replaceAll('/', '-') + " " + "00:00:00";
                let endTime = (thatDay.toLocaleDateString() + "").replaceAll('/', '-') + " 23:59:59";
                for (let i = 0; i < formatBooks.length; i++) {
                    let a = parseInt(formatBooks[i]["hint"].split(" ")[0].replaceAll(":", ""));
                    let b = parseInt(startTime.split(" ")[1].replaceAll(":", ""));
                    if (a != b && a != 240000) {
                        let obj = {
                            start: makeIt(startTime),
                            end: makeIt(formatBooks[i]["start"])
                        }
                        ans.push(obj);
                    }
                    startTime = formatBooks[i]["end"];
                }
                if (!startTime.split(" ")[1].startsWith("23:59")) {
                    ans.push({
                        start: makeIt(startTime),
                        end: makeIt(endTime)
                    });
                }
                return res.status(200).send(ans);
            } catch (err) {
                next(err);
            }
        },

    bookARoom:
        async (req, res, next) => {
            try {
                const { id } = req.params;
                let formattedStart = formatter(req.body.start);
                let formattedEnd = formatter(req.body.end);
                const start = new Date(formattedStart);
                const end = new Date(formattedEnd);
                const validRoomId = await db.room.findOne({
                    where: {
                        id
                    }
                });
                if (!validRoomId) {
                    return res.status(404).send({ message: 'topilmadi' });
                }

                if (isNaN(start) || isNaN(end) || start >= end) {
                    return res.status(400).send('Invalid dates');
                }
                const isFree = await db.book.findOne({
                    where: {
                        roomId: id,
                        [db.Sequelize.Op.and]: {
                            start: {
                                [db.Sequelize.Op.lt]: end
                            },
                            end: {
                                [db.Sequelize.Op.gt]: start
                            }
                        }
                    }
                });
                if (isFree) {
                    return res.status(410).send({
                        error: "uzr, siz tanlagan vaqtda xona band"
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
                    start: start,
                    end: end
                });
                await resident.save();
                await newBook.save();
                return res.status(201).send({
                    message: "xona muvaffaqiyatli band qilindi"
                });
            } catch (err) {
                next(err);
            }
        }
}

module.exports = BookingController;