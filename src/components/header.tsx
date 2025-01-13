import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { StyledHeader, StyledLogo, NavContainer, NavLink, RoundedImage } from "../components/headercss"
import myPortrait from "../images/codeologyportrait.jpg";
import Icon from "../icons/icon"; 
import { StaticImage } from 'gatsby-plugin-image';

const Header = () => {
  return (
    <StyledHeader>

      <StaticImage 
        src="../images/test.jpg"
        alt="A dinosaur"
        width={200}
        height={200}
      />
      <RoundedImage
        className="portrait" src={myPortrait} alt="My image" width={200}/> 
      <h1>
        John Glen Siy
      </h1>
      <h2>
        johnglen_siy [at] <br></br>
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