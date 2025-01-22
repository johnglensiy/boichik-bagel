import styled from "styled-components";

export const StyledHeader = styled.header`
    outline: 1px solid black;
    position: sticky;
    top: 0;
    z-index: 1000;

    width: 300px;
    height: 100vh;
    margin: 0 auto;
    padding: 0 20px;
    padding-top: 100px;
    // background: white;

    display: flex;
    // flex: 1;
    flex-direction: column;
    // justify-content: space-between;
    // align-items: center;
    overflow: hidden;

    a {
        // display: flex;
        align-items: center;
        justify-content: space-between;
        // outline: 1px solid black;
    }

    p {
        padding: 0px;
        margin-top: 5px;
        margin-bottom: 5px;
        // outline: 1px solid black;
        align-items: center;
        justify-content: center;
    }

    #external-links {
        list-style: none;
        padding-left: 0px;
    }

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
    // margin: 0 10px;
    // font-size: 1rem;
    // font-weight: 300;
    // color: black;
`

export const RoundedImage = styled.div`
    // border-radius: 50%;
    align-items: center;
`