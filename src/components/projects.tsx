import React, { useState } from 'react'
import styled from 'styled-components'

import { myProjects } from "../pages/index"
import myPortrait from "../codeologyportrait.jpg"

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
            <h1>These are my projects</h1>
        </div>
        // <Section>
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
        // </Section>
    )
}

export default Projects