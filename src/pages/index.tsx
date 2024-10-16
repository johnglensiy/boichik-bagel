import * as React from "react"
import styled from "styled-components"

import Layout from "../components/layout"
import Hero from "../components/hero"
import Projects from "../components/projects"

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

export default function Home() {
  return (
    <Layout>
        <Hero/>
        <Projects/>
        {/* <h1>Hi! Boop</h1> */}
    </Layout>
  )
}
