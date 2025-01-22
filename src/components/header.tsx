import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { StyledHeader, StyledLogo, NavContainer, NavLink, RoundedImage } from "../components/headercss"
import myPortrait from "../images/codeologyavatar.png";
import Icon from "../icons/icon"; 

const Header = () => {
  return (
    <StyledHeader>
      <RoundedImage>
       
      </RoundedImage>
      <h2>
        John Glen Siy
      </h2>
      <p>
        johnglen_siy [at] <br></br>
        berkeley.edu
      </p>

      <ul id="external-links">
        <li>
          <a href="https://github.com/johnglensiy" target="_blank" rel="noopener noreferrer">
            Github
          </a>
        </li>  
        <li>
          <a href="johnglensiy_resume_sweintern.pdf" target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/johnglensiy/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>    
      </ul>

      

      {/* <Link to="/" aria-label="home">
        <StyledLogo>jgs.</StyledLogo>
      </Link> */}

      <div>
          <NavLink>
            <Link to="/" aria-label="home">About</Link>
          </NavLink>
          <NavLink>
            <Link to="#projects-section" aria-label="home">Projects</Link>
          </NavLink>
          <NavLink>
            <Link to="#hobbies-section" aria-label="home">More</Link>
          </NavLink>
      </div>
    </StyledHeader>
  )
}

export default Header