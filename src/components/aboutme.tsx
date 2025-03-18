import React from "react";
import { StyledAboutMe } from "../components/aboutmecss";
import VisitCounter from "../components/visitCounter";

const AboutMe = ({ content }) => {
    const {frontmatter, rawMarkdownBody} = content.projects.edges[0].node;
    return (
        <StyledAboutMe>
            <p>
                Hi! I'm John, an Electrical Engineering and Computer Science
                student at UC Berkeley. <br/>

                # about work and what I'm passionate about <br/>
                # about codeology <br/>
                # about hobbies <br/>
            </p>

            <hr/>
        </StyledAboutMe>

        
    );
};

export default AboutMe;
