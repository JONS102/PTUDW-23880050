'use strict';

const controller = {};
const models = require('../models');
controller.showHomepage = async(req, res) => {
    const recentProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice', 'createdAt'], // chỉ lấy các thuộc tính id, name, image, price, stars của sản phẩm
        order: [
            ['createdAt', 'DESC'] // sawp theo ngày tạo sản phẩm mới nhất, nên ngày tạo sẽ giảm dần
        ],
        limmit: 10
    });
    res.locals.recentProducts = recentProducts; // truyền các sản phẩm tới index.hbs để hiển thị
    const featuredProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'], // chỉ lấy các thuộc tính id, name, image, price, stars của sản phẩm
        order: [
            ['stars', 'DESC']
        ],
        limit: 10
    }); // tìm tất cả các sản phẩm trong bảng Productord
    res.locals.featuredProducts = featuredProducts; // truyền các sản phẩm tới index.hbs để hiển thị
    const categories = await models.Category.findAll(); // tìm tất cả các danh mục trong bảng Category// [1,2,3,4]=> [1.[3,4].2]

    const secondArray = categories.splice(2, 2); // lấy 2 phần tử từ vị trí thứ 2 trong mảng categories
    const thirdArray = categories.splice(1, 1);
    res.locals.categoryArray = [categories, secondArray, thirdArray]; // truyền các danh mục tới index.hbs để hiển thị
    const Brand = models.Brand;
    const brands = await Brand.findAll();
    console.log(brands);
    res.render('index', { brands }); // truyền các brands tới index.hbs để hiển thị
};

controller.showPage = (req, res, next) => { // render file hbs theo tên file truyền vào url')
    const pages = ['cart', 'checkout', 'contact', 'login', 'my-account', 'product-detail', 'product-list', 'wishlist']; // danh sách các trang có thể render
    if (pages.includes(req.params.page))
        res.render(req.params.page);
    next(); // nếu không tìm thấy trang thì chuyển sang middleware tiếp theo
}

module.exports = controller; // xuất controller để sử dụng ở nơi khác