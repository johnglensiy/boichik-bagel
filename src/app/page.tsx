import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import Image from 'next/image';

import ViewCount from "@/components/ViewCount";
import ProjectCard from "@/components/ProjectCard";
import ProjectsClient from '@/components/ProjectsClient';

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

  const sectionIds = ["about", "projects", "coursework"];

  return (
    <div className="flex min-h-screen justify-center bg-black font-sans dark:bg-slate-50">
      <div className="hidden lg:flex lg:flex-col lg:w-64 px-6 py-10 bg-slate-50 text-black border">
        <h2 className="text-3xl font-semibold mb-6">John Glen Siy</h2>
        <p>EECS @ Berkeley</p>
        <p>johnglen_siy@berkeley.edu</p>
        <nav className="flex flex-col mt-4 mb-4">
          <a href="">LinkedIn</a>
          <a href="">Github</a>
          <a href="">Resume</a>
          <a href="#about" className="mt-12">About</a>
          <a href="#projects">Projects</a>
        </nav>
        <ViewCount initialViews={67}/>
      </div>
      <main className="flex gap-20 min-h-screen w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-slate-50 text-black border sm:items-start">
        <div id="about" className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2 className="text-2xl font-bold">Hi! I'm John</h2>
          <p>
              Hi! I'm John, an undergraduate Electrical Engineering and Computer Science
              student at <span className="berkeley-cursor">UC Berkeley</span>. I'm a full-stack engineer
              interested in software development and building impactful projects.
              <br/>
              <br/>
              In spring semester of my sophomore year, I joined a small little CS club on campus called Codeology. 
              There I experienced my first exposure to industry level projects, and since then, I've been
              actively contributing as a software developer working for major clients like IBM and Samsung.
              If you're looking for large-scale software contract roles or business partnerships, 
              I highly recommend you check them out  <a href={"https://codeology.studentorg.berkeley.edu/"} target="_blank" rel="noopener noreferrer">here</a>!
              <br/>
              <br/>
              In my free time, I love bouldering (indoor v6, outdoor v4), running, and leveling up my
              cooking game. I'm also a huge sports fan and
              have been cheering for the Warriors since 2013 - go Dubs! <br/>
          </p>
        </div>
        
        <div id="projects">
          <ProjectsClient projects={projects}/>
        </div>

        <div id="coursework">
          <h2>Coursework</h2>
        </div>
        {/* <div id="hobbies-section">
          <div className="courses-list">
            {classes.map((semester, index) => (
              <div className="semester-div" key={index}>
                {semester.subjects.map((subject, i) => (
                  subject.link ? 
                    <p>
                      <a href={subject.link} target="_blank" rel="nooponer noreferrer">
                        {subject.name}
                      </a>
                    </p>
                    : 
                    <p>{subject.name}</p>
                ))}
              </div>
            ))}
          </div>
          
        </div> */}
      
      </main>
    </div>
  );
}
