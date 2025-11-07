import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h2>Hi! I'm John</h2>
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
      </main>
    </div>
  );
}
