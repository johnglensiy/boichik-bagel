import React from "react"
import styled from "styled-components"

import { HeroSection, HeroSectionPortrait } from "../components/herocss.tsx"
import myPortrait from "../codeologyportrait.jpg"

const Hero = (props: any) => {
  return (
    <HeroSection id="hero">
      <div className="inner-div">
        <div>
          <h1 className="title">
            Hello I'm John Glen Siy
          </h1>
          <h2 className="subtitle">
            I design and build <span className="highlighted">web applications</span> oolala
          </h2>
        </div>

        <HeroSectionPortrait>
          <img className="portrait" src={myPortrait} alt="My image" width={300}/>
        </HeroSectionPortrait>
          
      </div>
      
   
    </HeroSection>
  )
}

export default Hero
