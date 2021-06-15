import React from 'react'
import { Link } from 'react-router-dom'
import {useSelector} from 'react-redux'
// import axios from 'axios'

function Header() {
    const auth = useSelector(state => state.auth)
    
    const {user, isLogged} = auth

    const userLink = () => {
        return <li className="drop-nav">
            <Link to="#" className="avatar">
            <img src={user.avatar} alt="" /> {user.name} <i class="fa fa-angle-down" aria-hidden="true"></i>
            </Link>
            <div className="dropdown">
                <Link to="/profile">Tài khoản</Link>
                <Link to="/">Thoát</Link>
            </div>
        </li>
    }

    return (
        <header>
            <div className="search">
                <Link to="/"><i className="fa fa-search" aria-hidden="true"></i></Link>
                <input type="search" placeholder="Tìm kiếm"></input>
            </div>
            <div className="logo">
                <h2><Link to="/">Minh Hiền Blog</Link></h2>
            </div>
            <ul>
                {
                    isLogged ? userLink() : <li><Link to="/login">Đăng nhập</Link> | <Link to="/register">Đăng ký</Link></li>
                }
            </ul>
        </header>
    )
}

export default Header
