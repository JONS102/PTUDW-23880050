'use strict';
const controller = {};
const models = require('../models');

controller.checkout = async(req, res) => {
    let userId = 1; // hoặc lấy từ req.user.id nếu có đăng nhập
    const addresses = await models.Address.findAll({ where: { userId }, raw: true });
    const Cart = require('../controllers/cart');
    let cartInstance = new Cart(req.session.cart ? req.session.cart : {});
    res.render('checkout', { addresses: addresses, cart: cartInstance.getCart() });
};
controller.placeorders = async(req, res) => {
    let userId = 1; // hoặc lấy từ req.user.id nếu có đăng nhập
    let addressId = isNaN(req.body.addressId) ? 0 : parseInt(req.body.addressId);
    let address = await models.Address.findByPk(addressId); // tim địa chỉ theo id   csdl
    if (!address) //Neu   khong co dia chi thi tao moi
    {
        address = await models.Address.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobile: req.body.mobile,
            address: req.body.address,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            isDefault: req.body.isDefault,
            userId: userId
        });
    }

    let cart = req.session.cart;
    cart.shippingAddress = `${address.firstName} ${address.lastName}, Email: ${address.email}, Mobile: ${address.mobile}, Address: ${address.address}, ${address.city}, ${address.country}, ${address.state}, ${address.zipCode}`;
    cart.paymentMethod = req.body.payment;

    switch (req.body.payment) {
        case 'PAYPAL':
            return saveOrder(req, res, 'PAID');
            break;
        case 'COD':
            return saveOrder(req, res, 'UNPAID');
            break;
    }
    //return res.redirect('/users/checkout'); 


}
async function saveOrder(req, res, status) {
    const Cart = require('../controllers/cart');
    let cartInstance = new Cart(req.session.cart ? req.session.cart : {});
    let { items, ...others } = cartInstance.getCart();
    let userId = 1; // hoặc lấy từ req.user.id nếu có đăng nhập
    let order = await models.Order.create({
        userId,
        ...others,
        status
    });

    let orderDetails = [];
    items.forEach(item => {
        orderDetails.push({
            orderId: order.id,
            productId: item.product.id,
            price: item.product.price,
            quantity: item.quantity,
            total: item.total
        });
    });

    await models.OrderDetail.bulkCreate(orderDetails);
    req.session.cart = null; // Xóa giỏ hàng sau khi đặt hàng
    return res.render('error', { message: 'Thank you for your order!' });

}
module.exports = controller;