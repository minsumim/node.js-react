const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { User } = require("./models/User");
const { auth } = require("./middlewave/auth")

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI)
.then(()=>console.log('MongoDB Connected'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World 안냥'))

app.post('/api/users/registor', (req, res) => {
    // 회원가입할 때 필요한 정보들을 클라이언트에서 가져오면 그것들을 데이터 베이스에 넣어준다

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json ({sucess: false, err})
        return res.status(200).json({
            sucess:true
        })
    })
})

app.post('/api/users/login', (req, res) => {
    //로그인 기능 만들기

    //요청된 이메일이 데이터베이스에 있는지 찾는다

    User.findOne({email: req.body.email}, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다"
            })
        }

        //요청한 이메일이 데이터베이스에 있다면 비밀번호도 동일한지 확인한다

        user.comparePassword(req.body.password , (err, isMatch)=>{
            if(!isMatch)
            return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})

            //비밀번호까지 맞다면 토큰을 생성하기
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                //토큰을 저장한다(쿠키, 로컬 스토리지 등등에 저장할 수 있다)
                res.cookie('x_auth', user.token) 
                .status(200)
                .json({loginSuccess: true, userId:user._id})
            })

        })

    })

})

app.get('/api/users/auth', auth , (req, res) => {
    res.status(200).json({
        _id : req.user._id,
        isAdmin : req.user.role === 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        name : req.user.name,
        lastname : req.user.lastname,
        role : req.user.role,
        image : req.user.image
    })
})

app.get('/api/users/logout', auth , (req, res) =>{
    
    User.findOneAndUpdate({_id: req.user._id}, {token : ""}, (err, user) =>{
        if(err) return res.json({sucess : false , err});
        return res.status(200).send({
            sucess : true
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

