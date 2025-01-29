import React from 'react';

// Wrapper Component
const Frame = ({ children }) => {
  return (
  <>
    <div className='bg-black overflow-scroll w-screen h-screen flex flex-col'>
    <div className=' h-full  flex-col self-center px-[32px]  w-full max-w-[1314px]'>
        {children}
      </div>
    </div>
  </>
  );
};

export default Frame;