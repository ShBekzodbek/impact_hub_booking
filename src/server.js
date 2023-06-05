const express = require('express');

const moment = require('moment');

const app = express();

const logger = require('morgan');

const db = require('./models');

const router = require('./routes/route');

const ErrorHandler = require('./utils/error_handler');

const AdminController = require('./controllers/admin');

require('dotenv').config();

app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use("/api/rooms", router);

app.use("/api/admin/create", AdminController.createARoom);


app.use("*", (req, res, next) => {
    const err = new Error("Page not found");
    err.status = 404;
    next(err);
})

app.use(ErrorHandler);

process.on("unhandledRejection", () => {
    console.log("unhandledRejection");
    process.exit(1);
});

app.listen(process.env.port, () => {
    // db.syncDB();
    db.check();
    console.log(`Server is running on port ${process.env.port}`);
});

