import React from 'react'
import Image from 'next/image'

export default function ProjectCard() {
    const tech_used = ["Java", "GoLang", "Python", "Javascript", "HTML"]
    return (
    <a 
        href="https://github.com/61c-student/su23-proj3-johnglensiy" 
        target="_blank" 
        rel="nooponer noreferrer"
        className="block w-80 origin-top-left transition-transform duration-300 ease-in-out hover:scale-105"
    >
        <Image
            src="/sql-query-optimizer.png"
            alt="hi"
            width={275}
            height={275}
        />
        <div className="">
            <h3 className="my-2 font-bold">SQL Query Optimizer</h3>
            Database optimization to minimize the runtime of SQL query plans
            <div className="mt-2 project-techs flex gap-2 flex-wrap">
                {tech_used.map((tech, i) => (
                    <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full text-sm font-medium" key={i}>{tech}</span> 
                ))}
            </div>
        </div>
    </a>
  )
}
