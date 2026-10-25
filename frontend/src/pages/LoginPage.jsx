import React, { useEffect } from 'react'
import Login from '../components/Login/Login'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountBrand from '../components/Layout/AccountBrand';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.user);
    // if user is login then redirect to home page
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }

    }, [isAuthenticated, navigate])
    return (
        <div className="min-h-screen bg-[#f7f9fc]">
            <AccountBrand />
            <Login />
        </div>
    )
}

export default LoginPage
