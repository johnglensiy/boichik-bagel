import React from "react";
import VisitCounter from "../components/visitCounter";
import styled from 'styled-components';

import oregonBoulderImage from "../content/oregon-boulder.png"
import budapestImage from "../content/budapest.png"
import grandLakeCoImage from "../content/grandlakeco.jpg"

const StyledAboutMe = styled.div`
    width: auto;

    .image-container {
        margin-top: 100px;
        margin-bottom: 100px;

        display: flex;
        gap: 20px; 
        justify-content: center; 
        align-items: flex-start; 
    }

    figure {
        display: flex;
        flex-direction: column;
        align-items: center; 
        text-align: center;
    }

    .image-wrapper {
        display: flex;
        gap: 10px; 
    }

    figcaption {
        margin-top: 10px;
        font-size: 14px;
        max-width: 100%; 
        white-space: normal; 
        word-wrap: break-word; 
    }

    hr {
        width: 50%;
        color: gray;
    }
`

const AboutMe = ({ content }) => {
    const {frontmatter, rawMarkdownBody} = content.projects.edges[0].node;
    return (
        <StyledAboutMe>
            <h2>Hi! I'm John</h2>
            <p>
                Hi! I'm John, an undergraduate Electrical Engineering and Computer Science. 
                student at <span className="berkeley-cursor">UC Berkeley</span>. I'm a full-stack engineer
                interested in software development and building impactful projects.
                <br/>
                <br/>
                In spring semester of my sophomore year, I joined a small little CS club on campus called Codeology. 
                There I experienced my first exposure to industry level projects, and since then, I've been
                actively contributing as a software developer working for major clients like IBM and Samsung.
                If you're looking for large-scale software contract roles or business partnerships, 
                I highly recommend you check them out  <a href={"https://codeology.studentorg.berkeley.edu/"} target="_blank" rel="noopener noreferrer">here</a>!
                <br/>
                <br/>
                In my free time, I love bouldering (indoor v6, outdoor v4), running, and leveling up my
                cooking game. I'm also a huge sports fan and
                have been cheering for the Warriors since 2013 - go Dubs! <br/>
            </p>
            
            <div className="image-container">
                <figure>
                    <img src={oregonBoulderImage} alt="oregonBoulderImage" height={250}></img>
                    <figcaption>My first ever outdoor boulder in Oregon in 2024</figcaption>
                </figure>
                <figure>
                    <div className="image-wrapper">
                        <img src={budapestImage} alt="budapestImage" height={250}></img>
                        <img src={grandLakeCoImage} alt="grandlakeCoImage" height={250}></img>
                    </div>
                    <figcaption>Favorite places in the world I've been to so far - Budapest, Hungary and Grand Lake, Colorado</figcaption>
                </figure>

            </div>

        </StyledAboutMe>

        
    );
};

export default AboutMe;
