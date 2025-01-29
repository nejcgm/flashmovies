import React from 'react'

const ChevroneLeft = ({scrollToLeft,timerActive,top,isScrolling}) => {
  return (
    <button
      className={`absolute left-1 top-1/2 transform top-[35%] text-white z-10`}
      onClick={() => { scrollToLeft(), timerActive && timerActive() }}
      disabled={isScrolling}
    >
      <div className='group bg-black bg-opacity-35 border-white border-[1px] rounded-lg px-3 py-5'>
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-[#F5C518] transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor" role="presentation"><path d="M18.378 23.369c.398-.402.622-.947.622-1.516 0-.568-.224-1.113-.622-1.515l-8.249-8.34 8.25-8.34a2.16 2.16 0 0 0 .548-2.07A2.132 2.132 0 0 0 17.428.073a2.104 2.104 0 0 0-2.048.555l-9.758 9.866A2.153 2.153 0 0 0 5 12.009c0 .568.224 1.114.622 1.515l9.758 9.866c.808.817 2.17.817 2.998-.021z"></path></svg>
      </div>
    </button>
  )
}

export default ChevroneLeft