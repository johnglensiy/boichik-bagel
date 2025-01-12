import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { StyledHeader, StyledLogo, NavContainer, NavLink } from "../components/headercss"
import myPortrait from "../codeologyportrait.jpg";
import Icon from "../icons/icon"; 

const Header = () => {
  return (
    <StyledHeader>

      <img className="portrait" src={myPortrait} alt="My image" width={300}/>
      <h1>
        John Glen Siy
      </h1>
      <h2>
        johnglen_siy [at] \n 
        berkeley.edu
      </h2>
      <Icon name="Github"></Icon>

      <Link to="/" aria-label="home">
        <StyledLogo>jgs.</StyledLogo>


      </Link>
      <NavContainer>
          <NavLink>
            <Link to="/" aria-label="home">About</Link>
          </NavLink>
          <NavLink>
            <Link to="#projects-section" aria-label="home">Projects</Link>
          </NavLink>
          <NavLink>
            <Link to="/" aria-label="home">More</Link>
          </NavLink>
      </NavContainer>
    </StyledHeader>
  )
}

export default Header