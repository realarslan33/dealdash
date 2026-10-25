import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import AllCoupons from "../../components/Shop/AllCoupons";

const ShopAllCoupouns = () => {
    return (
        <div className="min-h-screen bg-[#f7f9fc]">
            <DashboardHeader />
            <div className="flex w-full items-start justify-between">
                <div className="sticky top-[80px] z-10 h-[calc(100vh-80px)] w-[70px] shrink-0 800px:w-[280px]">
                    <DashboardSideBar active={9} />
                </div>
                <div className="min-w-0 flex-1">
                    <AllCoupons />
                </div>
            </div>
        </div>
    )
}

export default ShopAllCoupouns