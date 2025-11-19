'use client'

import React from 'react'
import { useState } from 'react';

import { projects } from '@/app/page';
import ProjectCard from './ProjectCard';

export default function DropdownProjects() {
    const [isDropdownVisible, setDropdownVisibility] = useState<boolean>(false);

    return (
        <>
            <div className={`flex flex-row flex-wrap ${isDropdownVisible ? "bg-blue-500" : "bg-gray-500"}`}>
                {projects.filter((project) => project.category === 'software').slice(3)
                    .map((project) => (
                    <ProjectCard key={project.id} {...project}/>
                ))}
            </div>
            <p onClick={() => setDropdownVisibility(!isDropdownVisible)}>
                Show more projects
            </p>
        </>
    )
}
