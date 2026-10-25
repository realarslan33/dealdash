import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import DashboardMessages from "../../components/Shop/DashboardMessages";

const ShopInboxPage = () => {
    return (
        <div className="min-h-screen bg-[#f7f9fc]">
            <DashboardHeader />
            <div className="flex w-full items-start justify-between">
                <div className="sticky top-[80px] z-10 h-[calc(100vh-80px)] w-[70px] shrink-0 800px:w-[280px]">
                    <DashboardSideBar active={8} />
                </div>
                <div className="min-w-0 flex-1">
                    <DashboardMessages />
                </div>
            </div>
        </div>
    )
}

export default ShopInboxPage