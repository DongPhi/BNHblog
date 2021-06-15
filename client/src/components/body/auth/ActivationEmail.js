import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router'
import axios from 'axios'
import {showErrMsg, showSuccessMsg} from '../../ultils/notification/Notification'

function ActivationEmail() {
    const {activation_token} = useParams()
    const [err, setErr] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if(activation_token){
            const activationEmail = async () => {
                try {
                    const res = await axios.post('/user/activation', {activation_token})
                    setSuccess(res.data.msg)
                } catch (err) {
                    err.response.data.msg && setErr()
                }
            }
            activationEmail()
        }
    })

    console.log(useParams(activation_token))
    return (
        <div className="active_page">
            {err && showErrMsg(err)}
            {success && showSuccessMsg(success)}
        </div>
    )
}

export default ActivationEmail
