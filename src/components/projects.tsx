import React, { useState } from 'react'
import styled from 'styled-components'

import { myProjects } from "../pages/index"
import { ProjectsSection, ProjectCard } from './projectscss'
import myPortrait from "../codeologyportrait.jpg"
import cpuProjectImage from "../content/projects/images/riscvCPU.png"

const Projects = (props: any) => {

    const projectCount = myProjects.length
    const [projectIndex, setProjectIndex] = useState(0)
    const thisProject = myProjects[projectIndex]

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

    return (
        <div id="projects-section">
            <h1>Projects Section</h1>
            <img
                src={cpuProjectImage} alt="cpuProjectImage" width={800}
            />
            <h4>RISC-V CPU</h4>
            <img
                src={cpuProjectImage} alt="cpuProjectImage" width={800}
            />
            <h4>johnglendsiy.me</h4>

            
            <ProjectsSection>
                <ProjectCard>
                    {myProjects[0].title}
                    <div className="project-descr">
                        {myProjects[0].description}
                    </div>
                </ProjectCard>
                <ProjectCard>
                    <div>{myProjects[0].title}</div>
                </ProjectCard>
                <ProjectCard>
                    <div>{myProjects[1].title}</div>
                </ProjectCard>
                <div>hola</div>
                <div>hello</div>
            </ProjectsSection>
        </div>
        // <div>
        //     <div id="projects-section">
        //     <h1>These are my projects</h1>
        // </div>
        // <div>
        //      <h2 className="title">
        //         My Projects
        //     </h2>
        //     <h3 className="subtitle">
        //         {thisProject.title}
        //     </h3>
        //     <img
        //         src={myPortrait} 
        //         alt="My image"
        //         width={50}
        //     >
        //     </img>

        //     <div className="description">
        //         {thisProject.description}
        //     </div>
        //     <button onClick={() => handleProjNav("prev")}>

        //     </button>
        //     <button onClick={() => handleProjNav("next")}>

        //     </button>
        // </div>
        // </div>
    )
}

export default Projects