import React from 'react'
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer'
import DashboardPage from './DashboardPage'

const BuyerPage = () => {
    return (
        <>
            <div>
                <Navbar_Buyer />
            </div>
            <div>
                <DashboardPage />
            </div>
        </>
    )
}

export default BuyerPage