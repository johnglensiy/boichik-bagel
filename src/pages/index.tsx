import * as React from "react"
import styled from "styled-components"
import { graphql } from 'gatsby'

import Layout from "../components/layout"
import Hero from "../components/hero"
import Projects from "../components/projects"
import Hobbies from "../components/hobbies"

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
        <Hero content = {data.hero.edges[0].node}/>
        <Projects/>
        <Hobbies/>
        {/* <h1>Hi! Boop</h1> */}
    </Layout>
  )
}

export const pageQuery = graphql`
  {
    hero: allMarkdownRemark {
      edges {
        node {
          frontmatter {
            greetings
            emoji
            title
            subtitlePrefix
            subtitleHighlight
          }
          rawMarkdownBody
        }
      }
    }
  }
`
