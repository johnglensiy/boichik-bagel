"use client";

import ContactSection from "./ContactSection";
import CourseworkSection from "./CourseworkSection";
import ProjectsSection, { type Project } from "./ProjectsSection";

export type { Project };

interface ContentSectionProps {
  sidebarShown: boolean;
  projects: Project[];
  onActiveProjectChange?: (project: Project | null) => void;
}

export default function ContentSection({
  sidebarShown,
  projects,
  onActiveProjectChange,
}: ContentSectionProps) {
  return (
    <div
      style={{
        opacity: sidebarShown ? 1 : 0,
        transform: sidebarShown ? "translateY(0)" : "translateY(24px)",
        marginLeft: sidebarShown ? "236px" : "0",
      }}
      className="transition-[opacity,transform,margin-left] duration-[550ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)]"
    >
      <ProjectsSection
        projects={projects}
        onActiveProjectChange={onActiveProjectChange}
      />
      <CourseworkSection />
      <ContactSection />
    </div>
  );
}
