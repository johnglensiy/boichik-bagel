import React, { useState } from 'react'
import styled from 'styled-components'

import { myProjects } from "../pages/index"
import myPortrait from "../codeologyportrait.jpg"
import cpuProjectImage from "../content/projects/images/riscvCPU.png"
import gitletImage from "../content/projects/images/gitlet.png"
import fileSharingSystemImage from "../content/projects/images/filesharingsystem.png"
import sixteenRobotImage from "../content/projects/images/sixteenrobot.png"

interface DropdownGridProps {
    isVisible: boolean;
}

const StyledProjectsSection = styled.section`
	display: flex;
	flex-direction: column;
	max-width: 1100px;

	h2::before, h3::before {
		content: "";
		display: inline-block;
		height: 12px;
		width: 12px;
		background-color: #ee5b36;
		margin-right: 10px;
	}

    .dropdown-button {
        width: auto;

        &:hover {
            text-decoration: underline;
        }
    }
    
}
`;

const ProjectGrid = styled.div`
	// outline: 1px solid black;
	overflow: hidden;
	list-style: none;
	padding-left: 0px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	grid-gap: 50px;
	row-gap: 1rem;
	position: relative;
	margin-top: 25px;

	@media (max-width: 1080px) {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
	
	a {
		text-decoration: none;
	}

	a:hover .project-description {
		text-decoration: underline;
	}
`;

const DropdownGrid = styled(ProjectGrid)<DropdownGridProps>`
    margin-top: 0px;
	max-height: ${(props) => (props.isVisible ? "1000px" : "0")};
	transition: max-height 0.25s ease-in-out;
`;

const FeaturedProject = styled.div`
	// outline: 1px solid black;
	flex-direction: column;
	width: 100%;
	max-width: 300px;
	display: flex;
	gap: 15px;
	overflow: hidden;

	transform-origin: top left;
	transition: transform 0.2s ease-in-out;

	.project-image {
		// outline: 1px solid black;
		display: inline-block;
	}

	.all-techs-container {
		padding-top: 0px;
		padding-bottom: 20px;

		.single-tech {
			background-color: #add8e6;
			border-radius: 20px;
			padding: 7px;
			padding-left: 12px;
			padding-right: 12px;
			margin-right: 5px;
		}
	}

	&:hover {
		transform: scale(1.03);
	}
`;



const Projects = ({ content }) => {

    const projectsToShow = content.projects.edges.filter(({node}) => node)
    const [isHiddenProjVisible, setHiddenProjVisible] = useState(false);

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

    const revealMoreProjects = () => {

        // toggle 
    }

    const {frontmatter, rawMarkdownBody} = content.projects.edges[2].node;

    return (
        <>
            <StyledProjectsSection id="projects-section">
                <h3>
                    Software Projects
                </h3>
                <ProjectGrid>
                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <FeaturedProject>
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
                        </FeaturedProject>
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
                </ProjectGrid>

                <DropdownGrid isVisible={isHiddenProjVisible}>
                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <FeaturedProject>
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
                        </FeaturedProject>
                    </a>

                    <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                        <FeaturedProject>
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
                        </FeaturedProject>
                    </a>
                </DropdownGrid>

                <p className="dropdown-button" onClick = {() => {
                    setHiddenProjVisible(!isHiddenProjVisible)
                    console.log("switched")
                }
                    }>Show {isHiddenProjVisible ? "less" : "more"} software projects</p>

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