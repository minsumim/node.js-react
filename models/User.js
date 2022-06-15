const mongoose = require('mongoose')


const userSchma = mongoose.Schema({
    name: {
        type : String,
        maxlength : 50
    },
    email: {
        type : String,
        trim : true,
        // 글자의 빈칸을 없애주는 역할을 함    
        unique: 1
    },
    password: {
        type : String,
        maxlength : 10
    },
    lastname: {
        type : String,
        maxlength : 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

const User = mongoose.model('User', userSchma);
module.exports = { User };