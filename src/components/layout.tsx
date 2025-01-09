import React from "react"
import styled from "styled-components"

import GlobalStyle from "./globalStyle"
import Header from "./header"
import Footer from "./footer"


const StyledLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 100%;
  //color: #ccd6f6;
  background-color: light-gray;
  scroll-behavior: smooth;
  outline: 10px solid black;

  #main-content {
    font-family: "Helvetica Neue", sans-serif;
    width: 70%;
    //max-width: 62.5rem;
    margin: 0 auto;
    margin-top: 100px;
    padding: 0 2.5rem;
  }
`

const Layout = ({ children }) => {
  return (
    <StyledLayout>
      <GlobalStyle />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </StyledLayout>
  )
}

export default Layout