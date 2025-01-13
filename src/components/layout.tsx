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
  color: black;
  background-color: #f1f1ef;
  scroll-behavior: smooth;
  outline: 10px solid black;

  #content {
    flex: 1;
    font-family: "Helvetica Neue", sans-serif;
    // margin: 0 auto;
    // margin-top: 100px;
    padding: 0 20px;
    padding-top: 100px;
    outline: 1px solid black;
  }

  #main-container {
    margin: 0 auto;
    // margin-top: 100px;
    width: 70%;
    display: flex;
    flex-direction: row;
    gap: 50px;
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