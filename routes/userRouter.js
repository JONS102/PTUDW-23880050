'use strict';
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { body, validationResult } = require('express-validator');
router.get('/checkout', usersController.checkout);
// ... các route khác
router.post(
    '/placeorders',
    (req, res, next) => {
        const { addressId } = req.body;
        if (addressId === '0') {
            // Chỉ validate địa chỉ mới nếu chọn ship to different address
            return [
                body('firstName').notEmpty().withMessage('First name is required!'),
                body('lastName').notEmpty().withMessage('Last name is required!'),
                body('email').notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
                body('mobile').notEmpty().withMessage('Mobile No. is required!'),
                body('address').notEmpty().withMessage('Address is required!')
            ].map(mw => mw(req, res, next));
        }
        next();
    },
    (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            let errorArray = errors.array();
            let message = '';
            for (let i = 0; i < errorArray.length; i++) {
                message += errorArray[i].msg + "<br/>";
            }
            return res.render('error', { message });
        }
        next();
    },
    usersController.placeorders
);

module.exports = router;