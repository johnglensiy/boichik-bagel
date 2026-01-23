import Image from "next/image"

export default function CourseworkSection() {
  const classes = [
		{
			category: "Semester 1",
			subjects: [
			  { name: "CS 61A: Structure of Computer Programs",
				link: "https://cs61a.org/" },
			  { name: "EECS 16A: Designing Information Devices and Systems",
				link: "https://eecs16a.org/"}
			]
		  },
		  {
			category: "Semester 2",
			subjects: [
			  { name: "CS 61B: Data Structures", 
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
			  { name: "CS 70: Discrete Mathematics and Probability",
				link: "https://www.eecs70.org/"},
			  { name: "DATA 100: Principles and Techniques of Data Science",
				link: "https://ds100.org/fa22/"},
			  { name: "PHYSICS 7B: Physics for Scientists and Engineers II" }
			]
		  },
		  {
			category: "Semester 4",
			subjects: [
			  { name: "CS 170: Efficient Algorithms and Intractable Problems",
				link: "https://cs170.org/"},
			  { name: "CS 61C: Computer Architecture",
				link: "https://cs61c.org/sp25/"},
			  { name: "CS 188: Artificial Intelligence",
				link: "https://inst.eecs.berkeley.edu/~cs188/sp24/"},
			  { name: "CS 195: Social Implications of Computing Technology",
				link: "https://cs195.org/fa23/"}
			]
		  },
		  {
			category: "Semester 5",
			subjects: [
			  { name: "CS 161: Computer Security",
				link: "https://sp25.cs161.org/"},
			  { name: "CS 186: Database Systems",
				link: "https://cs186berkeley.net/"}
			]
		  },
		  {
			category: "Semester 6",
			subjects: [
				{ name: "CS 168: Internet Architecture",
				  link: "https://sp25.cs168.io/"}
			]
		  },
		  {
			category: "Semester 7",
			subjects: [
				{ name: "CS 160: User Interface Design and Development",
				  link: ""},
				{ name: "ASTRO 7A: Introduction to Astrophysics",
				  link: ""
				},
			]
		  }
	];

	return (
		<div className="my-15">
			<h2 className="text-2xl font-bold">Coursework</h2>
			<div className="flex flex-row gap-20">
				<div className="">
					{classes.map((semester, index) => (
						<div className="my-2" key={index}>
							{semester.subjects.map((subject, i) => (
								subject.link ? 
									<p key={`${subject.name}`} id={`${subject.name}`}>
										<a href={subject.link} target="_blank" rel="nooponer noreferrer">
											{subject.name}
										</a>
									</p>
									: 
									<p key={`${subject.name}`} id={`${subject.name}`}>{subject.name}</p>
							))}
						</div>
					))}
				</div>
				<div className="flex justify-center items-center">
					<Image
						src={"/images/berkeley.png"}
						alt={"UC Berkeley"}
						width={400}
						height={200}
					/>
				</div>
			</div>
		</div>
	)
}

