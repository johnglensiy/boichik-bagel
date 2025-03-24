import styled from "styled-components";

import smallCursor from "../content/pleaseplease.png"

export const StyledAboutMe = styled.div`
    max-width: 750px;
    .berkeley-cursor:hover {
        color: blue;
        cursor: url(${smallCursor}) 32 32, auto;
    }
    hr {
        width: 50%;
        color: gray;
    }
`