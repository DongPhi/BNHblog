import React, {useState} from 'react'
import axios from 'axios'
import {showErrMsg, showSuccessMsg} from '../../ultils/notification/Notification'
import {isEmail, isEmpty, isLength, isMatch} from '../../ultils/validation/Validation'

const initialState = {
    name: '',
    email: '',
    password: '',
    cf_password:'',
    err: '',
    success: ''
}
function Register() {
    const [user, setUser] = useState(initialState)

    const {name, email, password, cf_password, err, success} = user

    const handleChangeInput = e => {
        const {name, value} = e.target
        setUser({...user, [name]:value, err:'', success:''})
    }
    const handleSubmit = async e => {
        e.preventDefault()
        if(isEmpty(name) || isEmpty(password)){
            return setUser({...user, err:"Vui lòng điền tất cả các trường", success:''})
        }
        if(!isEmail(email)){
            return setUser({...user, err:"Email không hợp lệ", success:''})
        }
        if(isLength(password)){
            return setUser({...user, err:"Vui lòng nhập mật khẩu trên 6 ký tự", success:''})
        }
        if(!isMatch(password, cf_password)){
            return setUser({...user, err:"Mật khẩu nhập lại không chính xác", success:''})
        }
        try {
            const res = await axios.post('/user/register', {
                name, email, password
            })
            setUser({...user, err:'', success:res.data.msg})
        } catch (err) {
            err.response.data.msg && setUser({...user, err: err.response.data.msg, success:''})
        }
    }
    return (
        <div className="login_bg">
            <div className="login_page">
                <h2>Tạo tài khoản của bạn</h2>
                {err && showErrMsg(err)}
                {success && showSuccessMsg(success)}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input type="text" placeholder="Tên của bạn" value={name} name="name" onChange={handleChangeInput} />  
                        <input type="text" placeholder="Email của bạn" value={email} name="email" onChange={handleChangeInput} />
                        <input type="password" placeholder="Mật khẩu" value={password} name="password" onChange={handleChangeInput} />
                        <input type="password" placeholder="Nhập lại mật khẩu" value={cf_password} name="cf_password" onChange={handleChangeInput} />
                    </div>
                    <button type="submit">Đăng ký</button>
                </form>
            </div>
        </div>
    )
}

export default Register
