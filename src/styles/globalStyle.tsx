import { createGlobalStyle } from "styled-components"
import fonts from './fonts';
import variables from './styleVariables';

const GlobalStyle = createGlobalStyle`
    ${fonts}
    ${variables}

    * {
        box-sizing: border-box;
    }
    html {
        width: 100%;
        height: 100%;
        scroll-behavior: smooth;
    }
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #f1f1ef;
        color: #8892b0;
        font-size: 14px;
        font-family: 'Lato';
        line-height: 1.5;
        font-weight: 400;
    }
    h1 {
        font-family: 'Lato', sans-serif;
        font-weight: 700;
        font-size: 2rem;
        line-height: 2.375rem;
        color: black;
        @media (min-width: 1200px) {
            font-size: 2.625rem;
            line-height: 4rem;
        }
    }
    h2 {
        font-family: 'Lato', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        line-height: 1.5rem;
        color: black;
        // outline: 1px solid black;
        margin-bottom: 0px;
        @media (min-width: 1200px) {
            font-size: 2rem;
            line-height: 3rem;
        }
    }
    h3 {
        font-family: 'Lato', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        line-height: 1.5rem;
        color: black;
        // outline: 1px solid black;
        margin-bottom: 0px;
        @media (min-width: 1200px) {
            font-size: 1.5rem;
            line-height: 1.5rem;
        }
    }
    h4 {
        font-family: 'Lato', sans-serif;
        font-weight: 700;
        font-size: 1.25rem;
        line-height: 1rem;
        color: black;
        // outline: 1px solid black;
        margin-bottom: 5px;
        margin-top: 0px;
        @media (min-width: 1200px) {
            font-size: 1rem;
            line-height: 1rem;
        }
    }
    p {
        font-family: 'Urbanist', sans-serif;
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.5rem;
        color: black;
        // @media (min-width: 1200px) {
        //     font-size: 2rem;
        //     line-height: 3rem;
        // }
    }
    a {
        display: inline-block;
        text-decoration: none;
        text-decoration-skip-ink: auto;
        color: inherit;
        cursor: pointer;
        &:hover,
        &:focus {
          outline: 0;
        }
    }
`

export default GlobalStyle