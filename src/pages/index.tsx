import * as React from "react"
import styled from "styled-components"
import { graphql } from 'gatsby'

import Layout from "../components/layout"
import Hero from "../components/hero"
import Projects from "../components/projects"
import Courses from "../components/courses"
import AboutMe from "../components/aboutme"

export const myProjects = [
  {
    title: "Avolingo",
    description: "Avolingo is ur mom's house"
  },
  {
    title: "Run this town",
    description: "We come for u"
  }
]

export default function Home({ data }) {
  return (
    <Layout>
        <AboutMe content={ data }/>
        <Projects content={data}/>
        <Courses/>
        {/* <h1>Hi! Boop</h1> */}
    </Layout>
  )

}

export const pageQuery = graphql`
  {
    projects: allMarkdownRemark (
      filter: {
        fileAbsolutePath: { regex: "/content/projects/" }  
      }
    ) {
      edges {
        node {
          frontmatter {
            date
            title
            github
            external
            category
            tech
            company
            showInProjects
          }
          rawMarkdownBody
        }
      }
    }
  }
`
