import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import Footer from '../../components/Layout/Footer'
import OrderDetails from "../../components/Shop/OrderDetails";

const ShopOrderDetails = () => {
    return (
        <div className="min-h-screen bg-[#f7f9fc] flex flex-col justify-between">
            <DashboardHeader />
            <div className="flex-1">
                <OrderDetails />
            </div>
            <Footer />
        </div>
    )
}

export default ShopOrderDetails;
