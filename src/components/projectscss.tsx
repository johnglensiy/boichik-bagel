import styled from "styled-components";

export const ProjectsSection = styled.section`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    column-gap: 50px;
    row-gap: 50px;
    margin-bottom: 80px;
    scroll-margin-top: 50px;
    outline: 1px solid black;
    @media (max-width: 768px) {
        display: block;
    }
`

export const ProjectCard = styled.div`
    padding: 25px;
    background-color: #e6e18f;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    min-height: 350px;

    font-weight: bold;

    .project-descr {
        font-size: 16px;
        font-weight: 300;
    }
    // grid-column: 1 / 3;
    // grid-row: 1;
`

