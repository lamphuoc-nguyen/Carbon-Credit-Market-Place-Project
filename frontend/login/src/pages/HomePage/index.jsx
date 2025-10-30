import React from 'react'
import carImage from '../../image/car.jpg'

const HomePage = () => {
  return (
    <div style={{ backgroundImage: `url(${carImage})`, height: '100vh', backgroundSize: 'cover' }}>
    </div>
  )
}

export default HomePage