import * as React from "react"
import { Link } from "gatsby"
import styled from "styled-components"
import { StyledHeader, StyledLogo, NavContainer, NavLink } from "../components/headercss.tsx"

const Header = () => {
  return (
    <StyledHeader>
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