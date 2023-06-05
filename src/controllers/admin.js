const db = require('../models/index');

const AdminController = {
    createARoom: async (req, res, next) => {
        try {
            const { name, type, capacity } = req.body;
            const isValidRoomName = await db.room.findOne({
                where: {
                    name
                }
            });
            if (isValidRoomName) {
                return res.status(400).send({
                    message: 'Room name is already taken'
                });
            }
            const room = await db.room.create({
                name,
                type,
                capacity
            });
            await room.save()
            return res.status(201).send(room);
        } catch (err) {
            next(err);
        }
    }
}


module.exports = AdminController