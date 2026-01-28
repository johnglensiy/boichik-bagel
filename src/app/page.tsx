import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import Image from 'next/image';

import ViewCount from "@/components/ViewCount";
import ProjectCard from "@/components/ProjectCard";
import ProjectsClient from '@/app/sections/ProjectsClient';
import ScrollTracker from '@/components/ScrollTracker';
import BioSection from './sections/BioSection';
import CourseworkSection from './sections/CourseworkSection';

export interface ProjectData {
  id: string,
  date: string,
  title: string,
  github: string,
  external: string,
  category: string,
  techStack: string[],
  company: string,
  showInProjects: boolean,
  content: string,
}

export default function Home() {
  // Read markdown files
  const projectsDir = path.join(process.cwd(), 'public/projects');
  const projectFiles = fs.readdirSync(projectsDir);

  const projects = projectFiles.map((filename) => {
    const filePath = path.join(projectsDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      id: filename.replace('.md', ''),
      date: data.date as string,
      title: data.title as string,
      github: data.github as string,
      external: data.external as string,
      category: data.category as string,
      techStack: data.techStack as string[],
      company: data.company as string,
      showInProjects: data.showInProjects as boolean,
      content
    } as ProjectData;
  })

  const classes = [
		{
			category: "Semester 1",
			subjects: [
			  { name: "COMPSCI 61A: Structure of Computer Programs",
				link: "https://cs61a.org/" },
			  { name: "EECS 16A: Designing Information Devices and Systems",
				link: "https://eecs16a.org/"}
			]
		  },
		  {
			category: "Semester 2",
			subjects: [
			  { name: "COMPSCI 61B: Data Structures", 
				link: "https://sp25.datastructur.es/"},
			  { name: "DATA 8: Foundations of Data Science",
				link: "https://www.data8.org/sp22/"},
			  { name: "EECS 16B: Designing Information Devices and Systems II",
				link: "https://eecs16b.org/"},
			  { name: "PHYSICS 7A: Physics for Scientists and Engineers" }
			]
		  },
		  {
			category: "Semester 3",
			subjects: [
			  { name: "COMPSCI 70: Discrete Mathematics and Probability",
				link: "https://www.eecs70.org/"},
			  { name: "DATA 100: Principles and Techniques of Data Science",
				link: "https://ds100.org/fa22/"},
			  { name: "PHYSICS 7B: Physics for Scientists and Engineers II" }
			]
		  },
		  {
			category: "Semester 4",
			subjects: [
			  { name: "COMPSCI 170: Efficient Algorithms and Intractable Problems",
				link: "https://cs170.org/"},
			  { name: "COMPSCI 61C: Computer Architecture",
				link: "https://cs61c.org/sp25/"},
			  { name: "COMPSCI 188: Artificial Intelligence",
				link: "https://inst.eecs.berkeley.edu/~cs188/sp24/"},
			  { name: "COMPSCI 195: Social Implications of Computing Technology",
				link: "https://cs195.org/fa23/"}
			]
		  },
		  {
			category: "Semester 5",
			subjects: [
			  { name: "COMPSCI 161: Computer Security",
				link: "https://sp25.cs161.org/"},
			  { name: "COMPSCI 186: Database Systems",
				link: "https://cs186berkeley.net/"}
			]
		  },
		  {
			category: "Semester 6",
			subjects: [
				{ name: "COMPSCI 182: Deep Neural Networks",
				  link: "https://cs182sp21.github.io/"}
			]
		  },
		  {
			category: "Semester 7",
			subjects: [
				{ name: "COMPSCI 168: Internet Architecture",
				  link: "https://sp25.cs168.io/"},
				{ name: "COMPSCI 189: Machine Learning",
				  link: "https://people.eecs.berkeley.edu/~jrs/189/"}
			]
		  }
	];

  const sectionIDs = ["about-me", "projects", "coursework"];

  return (
    <div className="flex min-h-screen justify-center bg-black font-sans dark:bg-slate-50">
      <ScrollTracker trackedSectionIDs={sectionIDs}>
        <BioSection/>
        <ProjectsClient projects={projects}/>
        <CourseworkSection/>
      </ScrollTracker>
    </div>
  );
}
