import React from 'react'
import ArrowBack from '../assets/arrowback2.png'

const BackButton = () => {
  return (
    <>
        <button onClick={()=>{window.history.back()}}><img src={ArrowBack} alt="" /></button>
    </>
  )
}

export default BackButton