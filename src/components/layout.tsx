import React from "react"
import styled from "styled-components"

import GlobalStyle from "./globalStyle"
import Header from "./header"
import Footer from "./footer"


const StyledLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  color: #ccd6f6;
  background-color: light-gray;
  scroll-behavior: smooth;
  outline: 10px solid black;

  #left-banner {
    flex: 1;
    padding: 20px;
    background-color: #f4f4f4;
    position: sticky;
  }

  #content {
    flex: 1;
    font-family: "Helvetica Neue", sans-serif;
    // margin: 0 auto;
    // margin-top: 100px;
    // padding: 0 2.5rem;
    outline: 1px solid black;
  }

  #main-container {
    margin: 0 auto;
    margin-top: 100px;
    width: 80%;
    display: flex;
    flex-direction: row;
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