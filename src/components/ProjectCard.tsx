import React from 'react'
import Image from 'next/image'
import { Content } from 'next/font/google';
import { ProjectData } from '@/app/page';

export default function ProjectCard({ 
  title, 
  github, 
  external,
  techStack, 
  content,
  id 
}: ProjectData) {
    // Use external link if available, otherwise use github
    const url = external || github;
    
    return (
    <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mr-4 mb-4 block w-80 origin-top-left transition-transform duration-300 ease-in-out hover:scale-105"
    >
        <div className="relative w-full h-[160px] overflow-hidden rounded-lg">
            <Image
                src={`/images/projects/${id}.png`}
                alt={title}
                fill
                className="object-cover object-left-top"
            />
        </div>
        <div className="">
            <h3 className="my-2 font-bold">{title}</h3>
            {content}
            <div className="mt-2 mb-6 project-techs flex gap-2 flex-wrap">
                {techStack && techStack.map((tech, i) => (
                    <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full text-sm font-medium" key={i}>{tech}</span> 
                ))}
            </div>
        </div>
    </a>
  )
}
