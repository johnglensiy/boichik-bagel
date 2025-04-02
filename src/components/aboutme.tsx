import React from "react";
import VisitCounter from "../components/visitCounter";
import styled from 'styled-components';
import { useRef, useState } from "react";

import oregonBoulderImage from "../content/oregon-boulder.png"
import budapestImage from "../content/budapest.png"
import grandLakeCoImage from "../content/grandlakeco.jpg"
import travelPicsImage from "../content/travel-pics.png"

const StyledAboutMe = styled.div`
    width: auto;
`

const ImageGallery = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 50px;
    
    .gallery-container {
        // outline: 1px solid black;
        margin-top: 100px;
        margin-bottom: 100px;

        width: 800px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px; 
        overflow-x: hidden;
    }

    button {
        height: 50px;
    }

    .about-me-picture {   
        // outline: 1px solid black;
        
        flex: 0 0 100%;
        display: flex;
        flex-direction: row;

        justify-content: center;
        align-items: center; 
        text-align: center;
    }

    figcaption {
        margin-top: 10px;
        font-size: 14px;
        max-width: 100%; 
        white-space: normal; 
        word-wrap: break-word; 
    }

`

const AboutMe = ({ content }) => {

    const [imageIndex, setImageIndex] = useState(0);
    const galleryRef = useRef(null);

    const scrollToPrevItem = (index) => {
        if (!galleryRef.current) return;

        const prevIndex = index - 1;
        const images = galleryRef.current.children;

        if (images[prevIndex]) {
            images[prevIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center"});
            setImageIndex(prevIndex);
        }
    }

    const scrollToNextItem = (index) => {
        if (!galleryRef.current) return;

        const nextIndex = index + 1;
        const images = galleryRef.current.children;
        
        if (images[nextIndex]) {
            images[nextIndex].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center"});
            setImageIndex(nextIndex);
        }
    }

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

            <ImageGallery>
                <button onClick={() => scrollToPrevItem(imageIndex)}>Go to first</button>
                <div className="gallery-container" ref={galleryRef}>
                    <div className="about-me-picture">
                        <figure>
                            <img src={oregonBoulderImage} height={250}></img>
                            <figcaption>My first ever outdoor boulder in Oregon in 2024</figcaption>
                        </figure>
                    </div>
                    <div className="about-me-picture">
                        <figure>
                            <img src={travelPicsImage} height={250}></img>
                            <figcaption>Favorite places in the world I've been to so far - Budapest, Hungary and Grand Lake, Colorado</figcaption>
                        </figure>
                    </div>
                </div>
                <button onClick={() => scrollToNextItem(imageIndex)}>Go to second</button>
            </ImageGallery>

        </StyledAboutMe>

        
    );
};

export default AboutMe;
