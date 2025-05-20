'use strict'

const helper = {};

helper.createStarList = (stars) => {
    let star = Math.floor(stars); // làm tròn xuống số sao
    let half = stars - star; // lấy phần lẻ của số sao
    let str = '<div class="ratting">'; // tạo thẻ div chứa các sao
    let i;
    for (i = 0; i < star; i++) { // tạo các sao đầy đủ
        str += '<i class="fa fa-star"></i>'; // thêm thẻ i chứa sao vào thẻ div
    }
    if (half > 0) {
        str += '<i class="fa fa-star-half"></i>'; // thêm thẻ i chứa sao lẻ vào thẻ div
        i++;
    }
    for (; i < 5; i++) { // tạo các sao trống
        str += '<i class="fa fa-star-o"></i>'; // thêm thẻ i chứa sao trống vào thẻ div
    }
    str += '</div>'; // đóng thẻ div
    return str; // trả về chuỗi chứa các sao
}
module.exports = helper; // xuất controller để sử dụng ở nơi khác