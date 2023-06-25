const BookingController = require('../controllers/controller');

const router = require('express').Router();


// By the name of room and sort by the type 
// page number and page_size
router.get('/', BookingController.search);

// id will be given by params
router.get("/:id", BookingController.getARoom);

// date will be given by query params
// By default date is today
router.get("/:id/availability", BookingController.checkAvailability);

router.post("/:id/book", BookingController.bookARoom);



module.exports = router