"use client"

import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

import ViewCount from './ViewCount';

export default function ScrollTracker({
    trackedSectionIDs,
    children
} : {
    trackedSectionIDs: string[],
    children: React.ReactNode[];
}) {
    // Track state of active section
    const [focusedSection, setFocusedSection] = useState<string>();

    // Inject an observer hook to each section
    const observers = trackedSectionIDs.map(() => useInView({}));

    // Detect which section is in view
    useEffect(() => {
        observers.forEach(({ inView }, index) => {
            if (inView) {
                setFocusedSection(trackedSectionIDs[index])
                console.log(trackedSectionIDs[index])
            }
        })
    }, [observers.map((o) => o.inView).join(",")]);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div id="side-banner" className="hidden lg:flex lg:flex-col lg:w-64 px-6 py-10 bg-slate-50 text-black border-r border-gray-200 sticky top-0 h-screen">
                <h2 className="text-3xl font-semibold mb-6">John Glen Siy</h2>
                <p>EECS @ Berkeley</p>
                <p>johnglen_siy@berkeley.edu</p>
                <nav className="flex flex-col mt-4 mb-4 gap-2">
                    {trackedSectionIDs.map((sectionId) => (
                        <a 
                            key={sectionId}
                            href={`#${sectionId}`} 
                            className={`
                                relative transition-all 
                                hover:text-blue-600

                                ${focusedSection === sectionId ? "translate-x-4 text-blue-600 font-semibold" : ""}
                            `}
                        >
                            {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
                        </a>
                    ))}
                    <a href="" className="mt-8 hover:text-blue-600">LinkedIn</a>
                    <a href="" className="hover:text-blue-600">Github</a>
                    <a href="" className="hover:text-blue-600">Resume</a>
                </nav>
                <ViewCount initialViews={67}/>
            </div>

            {/* Main Content */}
            <main className="flex gap-20 w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-slate-50 text-black sm:items-start">
                {trackedSectionIDs.map((s: string, index: number) => (
                    <div key={s} id={s} ref={observers[index].ref}>
                        {children[index]}
                    </div>
                ))}
            </main>
        </div>
    )

}
