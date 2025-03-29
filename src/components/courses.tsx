import React from "react";
import styled from "styled-components";

const StyledCoursesSection = styled.section`
	// outline: 1px solid black;
	display: flex;
	flex-direction: column;
	margin-bottom: 80px;

	.semester-div {
		// outline: 1px solid black;
		// margin-bottom: 12px;

		p {
			line-height: 0.5;
		}

		a:hover {
			text-decoration: underline;
		}
	}
`

const Courses = (props: any) => {
	const classes = [
		{
			category: "Semester 1",
			subjects: [
			  { name: "COMPSCI 61A: The Structure and Interpretation of Computer Programs",
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

	return (
		<StyledCoursesSection id="hobbies-section">
			<h2>Coursework</h2>
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
		</StyledCoursesSection>
	)
}

export default Courses