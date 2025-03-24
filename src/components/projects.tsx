import React, { useState } from 'react'
import styled from 'styled-components'

import { myProjects } from "../pages/index"
import { ProjectsSection, ProjectCard, StyledProjectsSection } from './projectscss'
import myPortrait from "../codeologyportrait.jpg"
import cpuProjectImage from "../content/projects/images/riscvCPU.png"
import gitletImage from "../content/projects/images/gitlet.png"
import fileSharingSystemImage from "../content/projects/images/filesharingsystem.png"
import sixteenRobotImage from "../content/projects/images/sixteenrobot.png"

const Projects = ({ content }) => {

    const projectsToShow = content.projects.edges.filter(({node}) => node)

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

    const {frontmatter, rawMarkdownBody} = content.projects.edges[2].node;

    return (
        <>
            <StyledProjectsSection>
                <h3>
                    Software Projects
                </h3>
                <div className="project-grid">
                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <div className="featured-project">
                            <img
                                src={gitletImage} alt="gitletImage" width={300}
                            />
                            <div className="project-description">
                                <h4>Gitlet</h4>
                                A simple implementation of Git's version-control system
                            </div>
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </a>

                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <div className="featured-project">
                            <img
                                src={gitletImage} alt="gitletImage" width={300}
                            />
                            <div className="project-description">
                                <h4>johnglendsiy.me</h4>
                                A simple implementation of Git's version-control system
                            </div>
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </a>

                    <div className="featured-project">
                        <img
                            src={gitletImage} alt="fileSharingSystemImage" width={300}
                        />
                        <div className="project-description">
                            <h4>Secure File Sharing System</h4>
                            A simple implementation of Git's version-control system
                        </div>
                        <div className="all-techs-container">
                                <span className="single-tech"> Golang </span>    
                        </div> 
                    </div>

                    <a href={frontmatter.github} target="_blank" rel="noopener noreferrer"> 
                        <div className="featured-project">
                            <div className="project-image">
                                <img
                                    src={cpuProjectImage} alt="cpuProjectImage" width={300}
                                />
                            </div>
                            <div className="project-description">
                                <h4>SQL Query Optimizer</h4>
                                A virtual CPU that can run arithmetic RISC-V assembly instructions
                            </div>

                            {frontmatter.tech && ( 
                                <div className="all-techs-container">
                                    {frontmatter.tech.map((tech, i) => (
                                        <span className="single-tech" key={i}>{tech}</span> 
                                    ))}
                                </div>
                            )}

                        </div>
                    </a>

                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <div className="featured-project">
                            <img
                                src={gitletImage} alt="gitletImage"
                            />
                            <div className="project-description">
                                <h4>Matrix Multiplier</h4>
                                A simple implementation of Git's version-control system
                            </div>
                            <div className="all-techs-container">
                                <span className="single-tech"> Java </span>    
                            </div> 
                        </div>
                    </a>
                </div>
                <h3>
                    Data Science/NLP
                </h3>
                <div className="project-grid">
                    <div className="featured-project">
                        <img
                            src={sixteenRobotImage} alt="sixteenRobotImage" width={300}
                        />
                        <div>
                            <h4>Avolingo</h4> <br/>
                            <div className="all-techs-container">
                                <span className="single-tech"> Pandas </span>    
                            </div> 
                        </div>
                    </div>
                    <div className="featured-project">
                        <img
                            src={sixteenRobotImage} alt="sixteenRobotImage" width={300}
                        />
                        <div>
                            <h4>Spam Classifier</h4> <br/>
                            <div className="all-techs-container">
                                <span className="single-tech"> Pandas </span>    
                            </div> 
                        </div>
                    </div>
                </div>
                <h3>
                    Hardware/Electrical Engineering
                </h3>
                <div className="project-grid">
                    <a href={frontmatter.github} target="_blank" rel="noopener noreferrer"> 
                        <div className="featured-project">
                            <div className="project-image">
                                <img
                                    src={cpuProjectImage} alt="cpuProjectImage" width={300}
                                />
                            </div>
                            <div className="project-description">
                                <h4>RISC-V CPU</h4>
                                A virtual CPU that can run arithmetic RISC-V assembly instructions
                            </div>

                            {frontmatter.tech && ( 
                                <div className="all-techs-container">
                                    {frontmatter.tech.map((tech, i) => (
                                        <span className="single-tech" key={i}>{tech}</span> 
                                    ))}
                                </div>
                            )}

                        </div>
                    </a>
                    <div className="featured-project">
                        <div className="project-image">
                            <img
                                src={cpuProjectImage} alt="cpuProjectImage" width={300}
                            />
                        </div>
                        <div className="project-description">
                            <h4>S1XT33N</h4>
                            An autonomous car that responds to voice commands using RLC circuits
                        </div>

                        <div className="all-techs-container">
                            <span className="single-tech">TI LaunchPad</span>
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