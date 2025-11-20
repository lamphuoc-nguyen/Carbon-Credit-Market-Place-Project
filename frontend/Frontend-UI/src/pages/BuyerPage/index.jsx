import React from 'react'
import Navbar_Buyer from '../../Components/BuyerComponents/Navbar-Buyer'
import MakerPlacePage from './MakerPlacePage'

const BuyerPage = () => {
  return (
    <>
    <div>
        <Navbar_Buyer/>
    </div>
    <div>
        <MakerPlacePage showNavbar={false} />
    </div>
    </>
  )
}

export default BuyerPage