import Image from "next/image";
import ViewCount from "@/components/ViewCount";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-black font-sans dark:bg-slate-50">
      <div className="hidden lg:flex lg:flex-col lg:w-64 px-6 py-10 bg-slate-50 text-black border">
        <h2 className="text-3xl font-semibold mb-6">John</h2>
        <nav className="flex flex-col gap-4">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
        </nav>
        <ViewCount initialViews={67}/>
      </div>
      <main className="flex gap-20 min-h-screen w-full max-w-5xl flex-col items-center justify-between py-32 px-16 bg-slate-50 text-black border sm:items-start">
        <div className="border flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
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
        <div className="flex flex-col">
          <h2 className="before:content-[''] before:inline-block before:h-3 before:w-3 before:bg-[#ee5b36] before:mr-2 text-2xl font-bold mb-6">Software Projects</h2>
          <div>
            <ProjectCard>
            </ProjectCard>
          </div>
        </div>
      </main>
    </div>
  );
}
