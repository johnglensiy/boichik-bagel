import React from "react"
import styled from "styled-components"

import { HeroSection, HeroSectionPortrait } from "../components/herocss.tsx"
import myPortrait from "../codeologyportrait.jpg"

const Hero = ({ content }) => {

  const { frontmatter, rawMarkdownBody } = content;
  return (
    <HeroSection id="hero">
      <div className="inner-div">
        <div className='left-banner'>
          <h1 className="title">
            {frontmatter.title}
          </h1>
          <h2 className="subtitle">
            I design and build <span className="highlighted">web applications</span> oolala
          </h2>
        </div>

        <div className='right-scrollable'>
          <HeroSectionPortrait>
            <img className="portrait" src={myPortrait} alt="My image" width={300}/>
          </HeroSectionPortrait>
        </div>
       
          
      </div>
      
   
    </HeroSection>
  )
}

export default Hero
