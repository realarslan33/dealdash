import { useEffect } from 'react';
import ShopLogin from "../components/Shop/ShopLogin";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountBrand from '../components/Layout/AccountBrand';

const ShopLoginPage = () => {
    const navigate = useNavigate();
    const { isSeller } = useSelector((state) => state.seller);
    // if user is login then redirect to home page
    useEffect(() => {
        if (isSeller === true) {
            navigate(`/dashboard`);
        }
    }, [isSeller, navigate]);

    return (
        <div className="min-h-screen bg-[#f7f9fc]">
            <AccountBrand />
            <ShopLogin />
        </div>
    );
};

export default ShopLoginPage;