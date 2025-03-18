import React, { useState } from 'react'
import styled from 'styled-components'

import { myProjects } from "../pages/index"
import { ProjectsSection, ProjectCard, StyledProjectsSection } from './projectscss'
import myPortrait from "../codeologyportrait.jpg"
import cpuProjectImage from "../content/projects/images/riscvCPU.png"

const Projects = ({ content }) => {

    const projectCount = myProjects.length
    const [projectIndex, setProjectIndex] = useState(0)
    const thisProject = myProjects[projectIndex]
    const projectsToShow = content.projects.edges.filter(({node}) => node)

    const handleProjNav = (direction: string) => {
        setProjectIndex( () => {
                if (direction === "prev") {
                    return projectIndex === 0 ? projectCount - 1: projectIndex - 1
                } 
                else {
                    return projectIndex === projectCount - 1 ? 0 : projectIndex + 1
                }
            }
        )
    }

    const projectCard = (node) => {
        const { frontmatter, rawMarkdownBody } = node;
        const { github, external, title, tech } = frontmatter;

        return (
            <div>
                <h4> {frontmatter.title} </h4>
                <br></br>
                {rawMarkdownBody}
            </div>
        );
    };

    return (
        <>
            <StyledProjectsSection>
                <h2>
                    Projects
                </h2>
                <div className="project-grid">

                    <div className="featured-project">
                        <div className="project-image">
                            <img
                                src={cpuProjectImage} alt="cpuProjectImage" width={300}
                            />
                        </div>
                        <div>
                            RISC-V CPU <br />
                            
                            A virtual CPU that can run arithmetic RISC-V assembly instructions
                            <div className="all-techs-container">
                                <span className="single-tech"> Javascript </span>    
                            </div> 
                            
                        </div>
                    </div>

                    <div className="featured-project">
                        <img
                            src={cpuProjectImage} alt="cpuProjectImage" width={300}
                        />
                        <div>
                            Gitlet <br />
                            A simple implementation of Git's version-control system
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </div>

                    <div className="featured-project">
                        <img
                            src={cpuProjectImage} alt="cpuProjectImage" width={300}
                        />
                        <div>
                            Gitlet <br />
                            A simple implementation of Git's version-control system
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </div>

                    <div className="featured-project">
                        <img
                            src={cpuProjectImage} alt="cpuProjectImage" width={300}
                        />
                        <div>
                            Gitlet <br />
                            A simple implementation of Git's version-control system
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </div>

                    <div className="featured-project">
                        <img
                            src={cpuProjectImage} alt="cpuProjectImage" width={300}
                        />
                        <div>
                            Gitlet <br />
                            A simple implementation of Git's version-control system
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </div>

                    <div className="featured-project">
                        <img
                            src={cpuProjectImage} alt="cpuProjectImage" width={300}
                        />
                        <div>
                            Gitlet <br />
                            A simple implementation of Git's version-control system
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </div>
                </div>

                {/* <ul className="project-grid">
                    { projectsToShow.map(({node}, i) => ( 
                        <div key={i}> { projectCard(node) } </div>
                        )) }
                </ul> */}
            </StyledProjectsSection>
        </>
    );
};

export default Projects;