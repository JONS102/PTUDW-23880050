'use strict';
const express = require('express');
const router = express.Router(); // cũng là index nhưng chuyển hướng qua router
const controller = require('../controllers/indexController');

// /CHỈ SỬ DỤNG KHI CẦN TẠO BẢNG TRONG CSDL
router.get('/createTables', (req, res) => {
    let models = require('../models'); // import models file
    models.sequelize.sync().then(() => { // đồng bộ hóa các model với cơ sở dữ liệu
        res.send('Create tables successfully!'); // gửi thông báo thành công
    });
});

// router.get('/', (req, res) => { res.render('index'); }); // render file index.hbs để chạy ra luôn trang chủ

//THAY THẾ
router.get('/', controller.showHomepage); // render file index.hbs để chạy ra luôn trang chủ
// router.get('/:page', (req, res) => { res.render(req.params.page); }); // render file hbs theo tên file truyền vào url')
//THAY THẾ
router.get('/:page', controller.showPage); // render file hbs theo tên file truyền vào url')

module.exports = router;