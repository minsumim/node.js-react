const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const saltRounds = 10;

const jwt = require('jsonwebtoken');




const userSchema = mongoose.Schema({
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
        maxlength : 110
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


userSchema.pre('save', function(next){

    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            });
        });
        //salt를 먼저 생성 -> salt를 이용해서 비밀번호를 암호화
    } else {
        next()
    }

})
// 유저모델의 유저정보를 저장하기 전에 암호화 

userSchema.methods.comparePassword = function(plainPassword, cb){

    //plainpassword 1234 와 데이터베이스에 있는 암호화된 비밀번호가 같은지 비교해야 한다
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })

}

userSchema.methods.generateToken = function(cb){

    var user = this;
    //jsonwebtoken을 이용해서 token을 생성하기

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
6
    // user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    // user._id + '' = token

    jwt.verify(token, 'secretToken', function(err, decoded) {
        user.findOne({"_id":decoded, "token" : token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema);
module.exports = { User };