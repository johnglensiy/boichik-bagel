import React from "react";
import VisitCounter from "../components/visitCounter";
import styled from 'styled-components';
import { useRef, useState, useEffect } from "react";

import oregonBoulderImage from "../content/oregon-boulder.png"
import budapestImage from "../content/budapest.png"
import grandLakeCoImage from "../content/grandlakeco.jpg"
import travelPicsImage from "../content/travel-pics.png"

interface ButtonVisibilityProps {
    galleryIndex: number;
    galleryLength: number;
};  

const StyledAboutMe = styled.div`
    width: auto;
`

const ImageGallery = styled.div<ButtonVisibilityProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    
    .gallery-container {
        margin-top: 50px;
        margin-bottom: 50px;

        width: 600px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 20px; 
        overflow-x: hidden;
    }

    button.left-arrow {
        all: unset;
        height: 50px;
        cursor: pointer;
        overflow: hidden;
        max-width: ${(props) => (
            props.galleryIndex == 0 ? "100%" : "0"
        )}
    }

    button.right-arrow {
        all: unset;
        height: 50px;
        cursor: pointer;
        overflow: hidden;
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
    const [galleryLength, setGalleryLength] = useState(0);
    const galleryRef = useRef(null);

    useEffect(() => {
        if (galleryRef.current) {
            setGalleryLength(galleryRef.current.children.length);
        }
    }, [galleryRef.current]);

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

            <ImageGallery galleryIndex={imageIndex} galleryLength={galleryRef.current?.children.length || 0}>
                <button className="left-arrow" onClick={() => scrollToPrevItem(imageIndex)}>
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="36" 
                    height="36" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#000000" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round">
                        <path d="M19 12H6M12 5l-7 7 7 7"/>
                </svg>

                </button>
                <div className="gallery-container" ref={galleryRef}>
                    {}
                    <div className="about-me-picture">
                        <figure>
                            <img src={oregonBoulderImage} height={250}></img>
                            <figcaption>My first ever outdoor boulder in Oregon in 2024</figcaption>
                        </figure>
                    </div>
                    <div className="about-me-picture">
                        <figure>
                            <img src={travelPicsImage} height={250}></img>
                            <figcaption>Favorite places in the world I've been to so far - Budapest and Grand Lake, Colorado</figcaption>
                        </figure>
                    </div>
                </div>
            
                <button className="right-arrow" onClick={() => scrollToNextItem(imageIndex)}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        width="36" 
                        height="36" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#000000" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round">
                            <path d="M5 12h13M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </ImageGallery>        

        </StyledAboutMe>
  
    );
};

export default AboutMe;
