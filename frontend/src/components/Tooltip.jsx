import React, { useState} from 'react'

const Tooltip = ({text, children}) => {
    const [isVisible, setIsVisible] = useState(false)
  return (
    <div className='relative flex flex-col items-center' 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
    >
        {children}
        {isVisible && <span className='bg-white px-3 py-1 rounded-lg text-sm shadow-lg absolute top-8 text-gray-700 border'>{text}</span>}
    </div>
  )
}

export default Tooltip