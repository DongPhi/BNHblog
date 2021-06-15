import React, {useState} from 'react'
import { Link, useHistory } from 'react-router-dom'
import axios from 'axios'
import {showErrMsg, showSuccessMsg} from '../../ultils/notification/Notification'
import {dispatchLogin} from '../../../redux/actions/authAction'
import {useDispatch} from 'react-redux'

const initialState = {
    email: '',
    password: '',
    err: '',
    success: ''
}
function Login() {
    const [user, setUser] = useState(initialState)
    const dispatch = useDispatch()
    const history = useHistory()

    const {email, password, err, success} = user

    const handleChangeInput = e => {
        const {name, value} = e.target
        setUser({...user, [name]:value, err:'', success:''})
    }
    const handleSubmit = async e => {
        e.preventDefault()
        try {
            const res = await axios.post('/user/login', {email, password})
            setUser({...user, err:'', success: res.data.msg})
            localStorage.setItem('firstLogin', true)
            dispatch(dispatchLogin())
            history.push("/")
        } catch (err) {
            err.response.data.msg && setUser({...user, err: err.response.data.msg, success:''})
        }
    }
    return (
        <div className="login_bg">
            <div className="login_page">
                <h2>Welcome Back!</h2>
                {err && showErrMsg(err)}
                {success && showSuccessMsg(success)}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input type="text" placeholder="Email của bạn" value={email} name="email" onChange={handleChangeInput} />
                        <input type="password" placeholder="Mật khẩu" value={password} name="password" onChange={handleChangeInput} />
                    </div>
                    <button type="submit">Đăng nhập</button>
                    <div className="forgot">
                        <Link to="/forgot_password">Bạn quên mật khẩu?</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
