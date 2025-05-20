'use strict';

const express = require('express'); // định nghĩa web server đơn giản
const app = express(); // tạo một ứng dụng express

const port = process.env.PORT || 3000; // cổng mà server sẽ lắng 
const expressHandlebars = require('express-handlebars'); // định nghĩa template engine handlebars
app.use(express.static('public'));
const { createStarList } = require('./controllers/handlebarsHelper');
const { createPagination } = require('express-handlebars-paginate'); // import các helper từ file handlebarsHelper.js
const session = require('express-session');


const cartController = require('./controllers/cartController'); // Thêm dòng này
const redisStore = require('connect-redis').default; // ĐÚNG cho v7.x
const { createClient } = require('redis');
const redisClient = createClient({
    url: 'rediss://red-d0m7aa95pdvs73900lcg:3GiFMYy65cFjgVjZIdtoswbr81YxZ5Ir@singapore-keyvalue.render.com:6379'
        // url: 'redis://red-d0m7aa95pdvs73900lcg:6379'
});
redisClient.connect().catch(console.error);

// cấu hình sử dụng express-handlebars
app.engine('hbs', expressHandlebars.engine({
    layoutsDir: __dirname + '/views/layouts', // thư mục chứa các layout
    partialsDir: __dirname + '/views/partials', // thư mục chứa các partials
    extname: 'hbs', // định nghĩa đuôi file template là hbs
    defaultLayout: 'layout', // định nghĩa layout mặc định là main.hbs
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // cho phép sử dụng các thuộc tính của prototype
        allowProtoMethodsByDefault: true, // cho phép sử dụng các phương thức của prototype
    },
    helpers: { // định nghĩa các helper để sử dụng trong template
        createStarList,
        createPagination,
    },
}));
app.set('view engine', 'hbs');

// Đặt lên trên tất cả các route
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'S3cret',
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000
    }
}));

// Middleware khởi tạo cart
app.use((req, res, next) => {
    const Cart = require('./controllers/cart');
    // Nếu đã có dữ liệu cart trong session, khởi tạo lại Cart từ dữ liệu đó
    req.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.cart.quantity;
    next();
});

// Sau đó mới tới các route
app.use('/products', require('./routes/productsRouter'));
app.post('/products/cart', cartController.add);

///routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/userRouter'));
//errors handler
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'File not Found!' }); // trả về lỗi 404 nếu không tìm thấy trang
});


app.use((error, req, res, next) => { // xử lý lỗi 404
    console.error(error); // in lỗi ra console
    res.status(500).render('error', { message: 'Internal Server Error!' }); // trả về lỗi 500
});

//Khởi động web server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // thông báo khi server đã khởi động
});