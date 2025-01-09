import styled from "styled-components";

export const HeroSection = styled.section`
    height: 100vh;

    .inner-div {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 150px;
        outline: 1px solid black;
        max-width: 1200 px;

        @media (max-width: 768px) {
            display: block;
        }
    }

    .left-banner {
        display: sticky;
        width: 300px;
        padding: 20px;
        height: 100%;
        overflow: hidden;
        outline: 1px solid black;
    }

    .right-scrollable {
        overflow-y: auto;
        padding: 20px;
        flex: 1;

    }

    .title {
        font-size: 3rem;
        margin-bottom: 10px;
        //color: #ccd6f6;
    }

    .subtitle {
        font-size: 1.5rem;
        margin-bottom: 0;
    }
    .highlighted {
        box-shadow: inset 0 -2.5rem 0 #cdf3e5;
    }
    .description {
        font-size: 1rem;
        display: flex;
        align-items: center;
    }
`;

export const HeroSectionPortrait = styled.div`
    //outline: 1px solid black;
    max-width: 300px;
    position: relative;
    
   
`