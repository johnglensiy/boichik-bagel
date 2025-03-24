import React from "react";
import { StyledAboutMe } from "../components/aboutmecss";
import VisitCounter from "../components/visitCounter";


const AboutMe = ({ content }) => {
    const {frontmatter, rawMarkdownBody} = content.projects.edges[0].node;
    return (
        <StyledAboutMe>
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

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </p>

            <hr/>
        </StyledAboutMe>

        
    );
};

export default AboutMe;
