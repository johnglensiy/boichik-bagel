import Image from "next/image";

const COURSEWORK = [
  {
    term: "Semester 1",
    subjects: [
      { name: "Structure of Computer Programs", link: "https://cs61a.org/" },
      {
        name: "Designing Information Devices and Systems",
        link: "https://eecs16a.org/",
      },
    ],
  },
  {
    term: "Semester 2",
    subjects: [
      { name: "Data Structures", link: "https://sp25.datastructur.es/" },
      {
        name: "Foundations of Data Science",
        link: "https://www.data8.org/sp22/",
      },
      {
        name: "Designing Information Devices and Systems II",
        link: "https://eecs16b.org/",
      },
      { name: "Physics for Scientists and Engineers", link: "" },
    ],
  },
  {
    term: "Semester 3",
    subjects: [
      {
        name: "Discrete Mathematics and Probability",
        link: "https://www.eecs70.org/",
      },
      {
        name: "Principles and Techniques of Data Science",
        link: "https://ds100.org/fa22/",
      },
      { name: "Physics for Scientists and Engineers II", link: "" },
    ],
  },
  {
    term: "Semester 4",
    subjects: [
      {
        name: "Efficient Algorithms and Intractable Problems",
        link: "https://cs170.org/",
      },
      { name: "Computer Architecture", link: "https://cs61c.org/sp25/" },
      {
        name: "Artificial Intelligence",
        link: "https://inst.eecs.berkeley.edu/~cs188/sp24/",
      },
      {
        name: "Social Implications of Computing Technology",
        link: "https://cs195.org/fa23/",
      },
    ],
  },
  {
    term: "Semester 5",
    subjects: [
      { name: "Computer Security", link: "https://sp25.cs161.org/" },
      { name: "Database Systems", link: "https://cs186berkeley.net/" },
    ],
  },
  {
    term: "Semester 6",
    subjects: [
      { name: "Internet Architecture", link: "https://sp25.cs168.io/" },
    ],
  },
  {
    term: "Semester 7",
    subjects: [
      { name: "User Interface Design and Development", link: "" },
      { name: "Introduction to Astrophysics", link: "" },
    ],
  },
];

export default function CourseworkSection() {
  return (
    <section
      id="coursework"
      className="py-[70px] px-[clamp(28px,6vw,90px)] bg-[#f2efe9] border-y border-[#e5ddce]"
    >
      <div className="max-w-[860px] mx-auto">
        <div className="text-[30px] leading-[1.1] font-medium font-newsreader text-[#3a342c]">
          Coursework
        </div>
        <p className="text-[12.5px] leading-[1.6] font-grotesk text-[#8a8072] mt-2 max-w-[560px]">
          I am a proud Berkeley EECS alumni!
        </p>
        <div className="grid grid-cols-[1.1fr_.9fr] gap-12 items-center mt-8">
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {COURSEWORK.map((semester) => (
              <div key={semester.term}>
                <div className="text-[10.5px] font-plex-mono text-[#a89b85] tracking-[.02em] mb-2">
                  {semester.term.toUpperCase()}
                </div>
                <div className="flex flex-col gap-1.5">
                  {semester.subjects.map((subject) =>
                    subject.link ? (
                      <a
                        key={subject.name}
                        href={subject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] leading-[1.4] font-grotesk"
                      >
                        {subject.name}
                      </a>
                    ) : (
                      <span
                        key={subject.name}
                        className="text-[12px] leading-[1.4] font-grotesk text-[#6d6154]"
                      >
                        {subject.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="aspect-[1/.82] rounded-[20px] overflow-hidden bg-[#ece5d8] border border-[#ddd6c8] shadow-[0_2px_20px_rgba(60,50,35,.06)] relative">
            <Image
              src="/images/berkeley.png"
              alt="UC Berkeley"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
