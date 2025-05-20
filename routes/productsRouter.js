'use strict'

let express = require('express');
let router = express.Router();
let controller = require('../controllers/productsController');
let cartController = require('../controllers/cartController');


router.get('/', controller.getData, controller.show);
router.get('/cart', cartController.show); // bị trùng với cart bên dưới nên cần xử lý trước
router.get('/:id', controller.getData, controller.showDetails);

router.post('/cart', cartController.add);
router.put('/cart', cartController.update); // Cập nhật giỏ hàng
// router.get('/cart', cartController.update); // cập nhật giỏ hàng
router.delete('/cart', cartController.remove); // xóa sản phẩm khỏi giỏ hàng
router.delete('/cart/all', cartController.clear); // xóa tất cả sản phẩm trong giỏ hàng
// hoặc nếu dùng DELETE:
// router.delete('/cart', cartController.clear);
module.exports = router;