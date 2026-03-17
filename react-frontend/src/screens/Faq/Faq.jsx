import React, { useState } from 'react'
import { questions } from './faq_data'
import "./faq.css"
import Accordion from '../../components/FaqAccordion/Accordion'

const Faq = () => {
  const [data] = useState(questions);

  return (
    <>
      <section className='main-faq'>
        <h1 className='faq-heading'>FAQ</h1>
        {
          data.map((curElem) => {
            const { id } = curElem;
            return <Accordion key={id} {...curElem} />
          }
          )
        }
      </section>
    </>
  )
}

export default Faq
