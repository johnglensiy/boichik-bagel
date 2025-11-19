'use client'
import React from 'react'
import { useState } from 'react';

import ProjectCard from './ProjectCard';
import { ProjectData } from '@/app/page';

export default function ProjectsClient({ projects }: { projects: ProjectData[] }) {
    const [isDropdownVisible, setDropdownVisibility] = useState<boolean>(false);

    return (
        <div id="projects-section" className="flex flex-col border">
            <h2 className="before:content-[''] before:inline-block before:h-3 before:w-3 before:bg-[#ee5b36] before:mr-2 text-2xl font-bold my-6">Software Engineering</h2>
            <div className="flex flex-row flex-wrap">
            {projects.filter((project) => project.category === 'software').slice(0,3)
                .map((project) => (
                <ProjectCard key={project.id} {...project}/>
            ))}
            </div>
            <div className={`flex flex-row flex-wrap overflow-hidden transition-all duration-300 ${isDropdownVisible ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                {projects.filter((project) => project.category === 'software').slice(3)
                    .map((project) => (
                    <ProjectCard key={project.id} {...project}/>
                ))}
            </div>
            <p onClick={() => setDropdownVisibility(!isDropdownVisible)} className="cursor-pointer hover:underline my-4">
                {isDropdownVisible ? "Show fewer projects" : "Show more projects"}
            </p>

            <h2 className="before:content-[''] before:inline-block before:h-3 before:w-3 before:bg-[#ee5b36] before:mr-2 text-2xl font-bold my-6">Data Science/NLP</h2>
            <div className="flex flex-row flex-wrap">
            {projects.filter((project) => project.category === 'data')
                .map((project) => (
                <ProjectCard key={project.id} {...project}/>
            ))}
            </div>

            <h2 className="before:content-[''] before:inline-block before:h-3 before:w-3 before:bg-[#ee5b36] before:mr-2 text-2xl font-bold my-6">Hardware/Electrical Engineering</h2>
            <div className="flex flex-row flex-wrap">
            {projects.filter((project) => project.category === 'hardware')
                .map((project) => (
                <ProjectCard key={project.id} {...project}/>
            ))}
            </div>
        </div>
    )
}