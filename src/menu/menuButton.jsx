import React,{useState} from 'react'
import PageSelector from './pageSelector'

const MenuButton = () => {
const [openMenu,setOpenMenu] = useState(false)
console.log(openMenu)

  return (
    <>
    {openMenu && <PageSelector  onCancel={()=>{setOpenMenu(false)}}/>}
    <button
    onClick={()=>{ setOpenMenu((prev) => !prev)}}
    className='group py-2 px-4 flex gap-3 items-center hover:bg-white/10 rounded-full'>
      <div className='border-t-[2px] border-b-[2px] border-white w-[20px] h-[15px] flex justify-between items-center'>
        <div className='h-[2px] w-full bg-white'></div>
      </div>
      <div className='text-white font-roboto'> Menu</div>
    </button>
    </>
  )
}

export default MenuButton