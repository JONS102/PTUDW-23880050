'use strict';

let controller = {};
let models = require('../models'); // import models từ thư mục models'..


controller.add = async(req, res) => {
    // ... kiểm tra dữ liệu ...
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
    let quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);

    let product = await models.Product.findByPk(id);
    if (product && quantity > 0) {
        req.cart.add(product, quantity);
        // Lưu lại dữ liệu cart vào session
        req.session.cart = req.cart;
    }

    console.log('Cart data:', req.cart.getCart());

    return res.json({ quantity: req.cart.quantity });
};
controller.show = (req, res) => {
    const Cart = require('./cart');
    let cartInstance = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.cart = cartInstance.getCart();
    return res.render('cart');
    //nếu chưa có thông tin giỏ hàng mà getCart() thì sẽ trả về một đối tượng rỗng
}
controller.update = async(req, res) => {
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
    let quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);
    if (quantity > 0) {
        let updatedItem = req.cart.update(id, quantity);
        req.session.cart = req.cart;
        return res.json({
            item: updatedItem,
            quantity: req.cart.quantity,
            subtotal: req.cart.subtotal,
            total: req.cart.total
        });
    }
    res.sendStatus(204).end();
}

controller.remove = async(req, res) => {
    let id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
    req.cart.remove(id); // thao tác trên instance Cart
    req.session.cart = req.cart; // lưu lại vào session
    return res.json({
        quantity: req.cart.quantity,
        subtotal: req.cart.subtotal,
        total: req.cart.total
    });
}

controller.clear = (req, res) => {
    req.cart.clear(); // Xóa toàn bộ giỏ hàng trên instance
    req.session.cart = req.cart; // Lưu lại vào session
    return res.sendStatus(200).end(); // Trả về status 204 (No Content)
};
module.exports = controller;