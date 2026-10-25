import { useEffect } from 'react';
import ShopCreate from "../components/Shop/ShopCreate";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AccountBrand from '../components/Layout/AccountBrand';

const ShopCreatePage = () => {
    const navigate = useNavigate();
    const { isSeller, seller } = useSelector((state) => state.seller);
    // if user is login then redirect to home page
    useEffect(() => {
        if (isSeller === true) {
            navigate(`/shop/${seller._id}`);
        }
    }, [isSeller, seller, navigate]);

    return (
        <div>
            <AccountBrand />
            <ShopCreate />
        </div>
    )
}

export default ShopCreatePage