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

	.project-techs {
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

    const softwareProjectsAsNodes = content.projects.edges.filter(
        edge => edge.node.frontmatter.category === "software" && edge.node.frontmatter.showInProjects);

    const hardwareProjectsAsNodes = content.projects.edges.filter(
        edge => edge.node.frontmatter.category === "hardware" && edge.node.frontmatter.showInProjects);

    const dataProjectsAsNodes = content.projects.edges.filter(
        edge => edge.node.frontmatter.category === "data" && edge.node.frontmatter.showInProjects);

    console.log("Filtered software projects:", softwareProjectsAsNodes);
    console.log("Filtered hardware projects:", hardwareProjectsAsNodes);
    console.log("Filtered data projects:", dataProjectsAsNodes);

    const ProjectCard = ({projectNode}) => {
        const { frontmatter, rawMarkdownBody } = projectNode;
        // const { category, github, title, tech } = frontmatter;

        return (
            <a href={frontmatter.github} target="_blank" rel="nooponer noreferrer">
                <FeaturedProject>
                    <img
                        src={`/images/${frontmatter.imageurl}`} alt="gitletImage" width={300}
                    />
                    <div className="project-description">
                        <h4>{frontmatter.title}</h4>
                        {rawMarkdownBody}
                    </div>

                    {frontmatter.tech && ( 
                        <div className="project-techs">
                            {frontmatter.tech.map((tech, i) => (
                                <span className="single-tech" key={i}>{tech}</span> 
                            ))}
                        </div>
                    )}
                </FeaturedProject>
            </a>
        );
    };

    const {frontmatter, rawMarkdownBody} = content.projects.edges[2].node;

    return (
        <>
            <StyledProjectsSection id="projects-section">

                <h3>
                    Software Projects
                </h3>
                <ProjectGrid>
                    {softwareProjectsAsNodes.slice(0, 3).map((projectEdge, index) => 
                        <ProjectCard key={index} projectNode={projectEdge.node}></ProjectCard>
                    )}
                </ProjectGrid>

                <DropdownGrid isVisible={isHiddenProjVisible}>
                    {softwareProjectsAsNodes.slice(3).map((projectEdge, index) => 
                        <ProjectCard key={index} projectNode={projectEdge.node}></ProjectCard>
                    )}
                </DropdownGrid>

                <p className="dropdown-button" onClick = {() => {
                    setHiddenProjVisible(!isHiddenProjVisible)
                }}>
                    Show {isHiddenProjVisible ? "less" : "more"} software projects
                </p>

                <h3>
                    Data Science/NLP
                </h3>

                <ProjectGrid>
                    {dataProjectsAsNodes.slice(0, 3).map((projectEdge, index) =>
                        <ProjectCard key={index} projectNode={projectEdge.node}></ProjectCard>
                    )}
                </ProjectGrid>

                <h3>
                    Hardware/Electrical Engineering
                </h3>

                <ProjectGrid>
                    {hardwareProjectsAsNodes.slice(0, 3).map((projectEdge, index) =>
                        <ProjectCard key={index} projectNode={projectEdge.node}></ProjectCard>
                    )}
                </ProjectGrid>

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