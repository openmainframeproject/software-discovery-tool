import React, { useState } from 'react'

const Accordion = ({ que, ans }) => {
  const [show, setShow] = useState(false)

  return (
    <>
      <div className='main-heading'>
        <p onClick={() => setShow(!show)}>{show ? '➖' : '➕'}</p>
        <h3>{que}</h3>
      </div>
      {show && <div className='answers'>{ans}</div>}
    </>
  )
}

export default Accordion
