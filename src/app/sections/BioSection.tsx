import { RollingText } from "@/components/ui/shadcn-io/rolling-text";

export default function BioSection() {
  return (
    <div className="flex flex-col items-center my-15 gap-6 max-w-200 text-center sm:items-start sm:text-left">
      <RollingText 
        className="text-5xl font-bold"
        text="Hi! I'm John"
        transition={{ duration: 0.8, delay: 0.08, ease: "easeOut" }}
      />
      <p>
          I'm a full-stack engineer interested in software development and building impactful projects.
          <br/>
          <br/>
          In spring semester of my sophomore year, I joined a CS club on campus called Codeology. 
          If you're looking for large-scale software contract roles or business partnerships, 
          I highly recommend you check them out <u> <a href={"https://codeology.studentorg.berkeley.edu/"} target="_blank" rel="noopener noreferrer">here</a></u>!
          <br/>
      </p>
    </div>
  )
}
