import React from "react";
import styled from "styled-components";

const StyledCoursesSection = styled.section`
	// outline: 1px solid black;
	display: flex;
	flex-direction: column;
	margin-bottom: 80px;

	ul {
		padding-left: 0;
		list-style-type: none;

		div {
			// outline: 1px solid black;
			margin-bottom: 12px;
		}
	}
`

const Hobbies = (props: any) => {
	return (
		<StyledCoursesSection id="hobbies-section">
			<h2>Coursework</h2>
			<ul>
				<div>
					<li>COMPSCI 61A: The Structure and Interpretation of Computer Programs </li>
					<li>EECS 16A: Designing Information Devices and Systems</li>
				</div>
				<div>
					<li>COMPSCI 61B: Data Structures </li>
					<li>DATA 8: Foundations of Data Science</li>
					<li>EECS 16B: Designing Information Devices and Systems II </li>
					<li>PHYSICS 7A: Physics for Scientists and Engineers</li>
				</div>
				<div>
					<li>COMPSCI 70: Discrete Mathematics and Probability </li>
					<li>DATA 100: Principles and Techniques of Data Science</li>
					<li>PHYSICS 7B: Physics for Scientists and Engineers II</li>
				</div>
				<div>
					<li>COMPSCI 170: Efficient Algorithms and Intractable Problems</li>
					<li>COMPSCI 61C: Computer Architecture</li>
					<li>COMPSCI 188: Artificial Intelligence</li>
					<li>COMPSCI 195: Social Implications of Computing Technology</li>
				</div>
				<div>
					<li>COMPSCI 161: Computer Security</li>
					<li>COMPSCI 186: Database Systems</li>
				</div>
				<div>
					<li>COMPSCI 182: Deep Neural Networks</li>
				</div>
				<div>
					<li>COMPSCI 168: Internet Architecture</li>
					<li>COMPSCI 189: Machine Learning</li>
				</div>
			</ul>
		</StyledCoursesSection>
	)
}

export default Hobbies