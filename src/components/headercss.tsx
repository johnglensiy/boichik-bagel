import styled from "styled-components";

export const StyledHeader = styled.header`
    //outline: 1px solid black;
    position: sticky;
    top: 0;
    z-index: 1000;

    width: 100%;
    height: 100vh;
    margin: 0 auto;
    padding: 0 2.5rem;
    // background: white;

    display: flex;
    flex: 1;
    flex-direction: column;
    // justify-content: space-between;
    // align-items: center;
    overflow: hidden;
    
    outline: 2px solid black;
`

export const StyledLogo = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: black;
`

export const NavContainer = styled.div`
    display: flex;
    align-items: center;
`

export const NavLink = styled.div`
    margin: 0 10px;
    font-size: 1rem;
    font-weight: 300;
    color: black;
`