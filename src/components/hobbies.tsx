import React from "react";
import styled from "styled-components";

import { HobbiesSection } from "../components/hobbiescss"

const Hobbies = (props: any) => {
  return (
    <HobbiesSection id="hobbies-section">
      <h2>Work Experience</h2> 
      <br/>
      <h2>Coursework</h2>
      <ul>
        <li>COMPSCI 61A: The Structure and Interpretation of Computer Programs </li>
        <li>EECS 16A: Designing Information Devices and Systems</li>
        <li>COMPSCI 61B: Data Structures </li>
        <li>COMPSCI 70: Discrete Mathematics and Probability </li>
        <li>EECS 16B: Designing Information Devices and Systems II </li>
        <li>PHYSICS 7A: Physics for Scientists and Engineers</li>
        <li>DATA 8: Foundations of Data Science</li>
        <li>COMPSCI 170: Efficient Algorithms and Intractable Problems</li>
        <li>DATA 100: Principles and Techniques of Data Science</li>
        <li>PHYSICS 7B: Physics for Scientists and Engineers II</li>
        <li>COMPSCI 61C: Computer Architecture</li>
        <li>COMPSCI 195: Social Implications of Computing Technology</li>
        <li>COMPSCI 188: Artificial Intelligence</li>
        <li>COMPSCI 161: Computer Security</li>
        <li>COMPSCI 186: Database Systems</li>
        <li>COMPSCI 182: Deep Neural Networks</li>
        <li>COMPSCI 168: Internet Architecture</li>
        <li>COMPSCI 189: Machine Learning</li>

      </ul>
    </HobbiesSection>
  )
}

export default Hobbies