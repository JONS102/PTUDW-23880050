'use strict';
let controller = {};
const models = require('../models');
//tách getData ra khỏi show để có thể sử dụng lại ở nhiều nơi khác nhau
const sequelize = require('sequelize');
const Op = sequelize.Op; // sử dụng toán tử trong sequelize
controller.getData = async(req, res, next) => {
    let categories = await models.Category.findAll({
        include: [{
            model: models.Product,
        }]
    }); //tải loại hàng
    res.locals.categories = categories;

    let brands = await models.Brand.findAll({
        include: [{
            model: models.Product,
        }]
    });
    res.locals.brands = brands; // tải thương hiệu hàng hóa

    let tags = await models.Tag.findAll();
    res.locals.tags = tags; // tải các thẻ hàng hóa
    next(); // gọi hàm tiếp theo trong middleware
}

controller.show = async(req, res) => {
    let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
    let brand = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand); // lấy giá trị của brand từ query string, nếu không phải số thì gán là 0
    let tag = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
    let keyword = req.query.keyword || ''; // nếu có thì nhập keyword không có thì để thông tin rỗng
    let sort = ['price', 'newest', 'popular'].includes(req.query.sort) ? req.query.sort : 'price'; // nếu có thì nhập sort không có thì để thông tin rỗng
    let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page)); // 
    // lấy giá trị của page từ query string, nếu không phải số thì gán là 1

    let options = {
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'], // chỉ lấy các thuộc tính id, name, image, price, stars của sản phẩm
        where: {} // điều kiện tìm kiếm
    };
    if (category > 0) {
        options.where.categoryId = category; // nếu có loại hàng thì thêm điều kiện tìm kiếm theo loại hàng
    }
    if (brand > 0) {
        options.where.brandId = brand; // nếu có thương hiệu thì thêm điều kiện tìm kiếm theo thương hiệu
    }

    if (tag > 0) {
        options.include = [{
            model: models.Tag,
            where: { id: tag } //liên kết lấy id từ bảng tag
        }];
    }
    if (keyword.trim() !== '') {
        options.where.name = {
            [Op.iLike]: `%${keyword}%` // miễn sao xuất hiện chữ trong keyword thì sẽ tìm thấy
        }
    }
    switch (sort) {
        case 'newest':
            options.order = [
                [
                    ['createdAt', 'DESC']
                ]
            ];
            break;
        case 'popular':
            options.order = [
                [
                    ['stars', 'DESC']
                ]
            ];
            break;
        default:
            options.order = [
                [
                    ['price', 'ASC']
                ]
            ];

    }
    res.locals.sort = sort;
    res.locals.originalUrl = removeParam('sort', req.originalUrl);
    if (Object.keys(req.query).length == 0) {
        res.locals.originalUrl = res.locals.originalUrl + "?";
    }

    const limit = 6;
    options.limit = limit;
    options.offset = limit * (page - 1);
    let { rows, count } = await models.Product.findAndCountAll(options);
    res.locals.pagination = {
            page: page,
            limit: limit,
            totalRows: count,
            queryParams: {...req.query },
        }
        // let products = await models.Product.findAll(options);
    res.locals.products = rows;
    res.render('product-list')
}

controller.showDetails = async(req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    let product = await models.Product.findOne({
        attributes: ['id', 'name', 'summary', 'stars', 'price', 'oldPrice', 'description', 'specification'],
        where: { id },
        include: [{
                model: models.Image,
                attributes: ['name', 'imagePath']
            },
            {
                model: models.Review,
                attributes: ['id', 'review', 'stars', 'createdAt'],
                include: [{
                    model: models.User,
                    attributes: ['firstName', 'lastName']
                }]
            }, {
                model: models.Tag,
                attributes: ['id'],
            }

        ]
    });
    res.locals.product = product;
    let tagIds = [];
    product.Tags.forEach(tag => {
        tagIds.push(tag.id);
    });
    let relatedProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'price', 'oldPrice'],
        include: [{
            model: models.Tag,
            attribute: ['id'],
            where: {
                id: {
                    [Op.in]: tagIds // tìm kiếm các sản phẩm có id trong mảng tagIds
                }
            }
        }],
        limit: 10
    })
    res.locals.relatedProducts = relatedProducts; // tải các sản phẩm liên quan
    res.render('product-detail');
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
module.exports = controller; // xuất controller để sử dụng ở nơi khác