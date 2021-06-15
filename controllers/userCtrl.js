const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendMail')

const {CLIENT_URL} = process.env

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body
            
            if(!name || !email || !password)
                return res.status(400).json({msg: "Vui lòng không để trống thông tin"})

            if(!validateEmail(email))
                return res.status(400).json({msg: "Email không đúng"})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "Email đã tồn tại"})

            if(password.length < 6)
                return res.status(400).json({msg: "Vui lòng nhập mật khẩu trên 6 ký tự"})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                name, email, password: passwordHash
            }

            const activation_token = createActivationToken(newUser)

            const url = `${CLIENT_URL}/user/activate/${activation_token}`
            sendMail(email, url, "Chọn vào đây để xác minh tài khoản")


            res.json({msg: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req, res) => {
        try {
            const {activation_token} = req.body
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

            const {name, email, password} = user
            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg:'Email đã tồn tại'})

            const newUser = new Users({
                name, email, password
            })

            await newUser.save()

            res.json({msg: 'Tài khoản xác minh thành công!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user){
                return res.status(400).json({msg:'Email không đúng hoặc chưa đăng ký'})
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                return res.status(400).json({msg: 'Mật khẩu không chính xác'})
            }
            
            const refresh_token = createRefreshToken({id: user._id})
            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })

            res.json({msg: 'Đăng nhập thành công!'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refresh_token
            if(!rf_token){
                return res.status(400).json({msg: 'Làm ơn. Hãy đăng nhập!'})
            }
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err){
                    return res.status(400).json({msg: 'Làm ơn. Hãy đăng nhập!'})
                }
                const access_token = createAccessToken({id: user.id})
                res.json({access_token})
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user){
                res.status(400).json({msg: 'Email không tồn tại!'})
            }
            const access_token = createAccessToken({id: user._id})
            const url = `${CLIENT_URL}/user/reset/${access_token}`

            sendMail(email, url, 'Chọn vào đây để lấy lại mật khẩu ')
            res.json({msg: 'Đã gửi lại mật khẩu. Vui lòng kiểm tra email'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    resetPassword: async (req, res) => {
        try {
            const {password} = req.body
            console.log(password)
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({_id: req.user.id},{
                password: passwordHash
            })

            res.json({msg: 'Đổi mật khẩu thành công'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserInfor: async(req, res) => {
        try{
            const user = await Users.findById(req.user.id).select('-password')
            res.json(user)
        }catch(err){
            return res.status(500).json({msg: err.message})
        }
    },
    getUserAllInfor: async(req, res) => {
        try {
            const users = await Users.find().select('-password')
            res.json(users)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async(req, res) => {
        try {
            res.clearCookie('refreshtoken', {path:'/user/refresh_token'})
            return res.json({msg: 'Đăng xuất thành công'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async(req, res) => {
        try {
            const {name, avatar} = req.body
            await Users.findOneAndUpdate({_id: req.user.id},{
                name, avatar
            })
            res.json({msg:'Cập nhật thành công'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUsersRole: async(req, res) => {
        try {
            const {role} = req.body
            await Users.findOneAndUpdate({_id: req.params.id},{
                role
            })
            res.json({msg:'Cập nhật thành công'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteUser: async(req, res) => {
        try {
            await Users.findByIdAndDelete(req.params.id)
            res.json({msg: 'Xóa thành công'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}



module.exports = userCtrl