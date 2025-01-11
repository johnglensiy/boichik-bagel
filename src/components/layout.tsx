import React from "react"
import styled from "styled-components"

import GlobalStyle from "../styles/globalStyle"
import Header from "./header"
import Footer from "./footer"


const StyledLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  color: #beceda;
  background-color: #fdf0e7;
  scroll-behavior: smooth;
  outline: 10px solid black;

  #content {
    flex: 2;
    font-family: "Helvetica Neue", sans-serif;
    // margin: 0 auto;
    // margin-top: 100px;
    // padding: 0 2.5rem;
    padding-top: 100px;
    // outline: 5px solid black;
  }

  #main-container {
    margin: 0 auto;
    // margin-top: 100px;
    width: 60%;
    display: flex;
    flex-direction: row;
    gap: 100px;
  }

  h1 {
    color: #beceda;
  }
`

const Layout = ({ children }) => {
  return (
    <StyledLayout>
      <GlobalStyle />
      <div id="main-container">
        <Header />
        <main id="content">
            {children}
        </main>
      </div>

      {/* <Footer /> */}
    </StyledLayout>
  )
}

export default Layout