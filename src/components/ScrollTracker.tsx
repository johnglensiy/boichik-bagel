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
    const observers = trackedSectionIDs.map(() => useInView({
        threshold: 0,
    }));

    // Detect which section is in view
    useEffect(() => {
        // Find the first (topmost) section that is in view
        for (let index = 0; index < observers.length; index++) {
            if (observers[index].inView) {
                setFocusedSection(trackedSectionIDs[index])
                console.log(trackedSectionIDs[index])
                break; // Stop after finding the first section in view
            }
        }
    }, [observers.map((o) => o.inView).join(",")]);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div id="side-banner" className="
                hidden lg:flex lg:flex-col lg:w-64 
                px-6 py-25 bg-slate-50 text-black 
                border-r border-gray-200 sticky mt-15 top-0 h-screen"
            >
                <h2 className="text-3xl font-semibold mb-6">John Glen Siy</h2>
                <p>EECS @ Berkeley</p>
                <p>johnglen_siy@berkeley.edu</p>
                <div className="flex flex-row mt-6 gap-5">
                    <a href="https://www.linkedin.com/in/johnglensiy/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 group">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
                        <path className="group-hover:fill-blue-600 transition-colors" d="M19.7065 3H4.34844C3.62264 3 3.04199 3.58065 3.04199 4.30645V19.6935C3.04199 20.3903 3.62264 21 4.34844 21H19.6485C20.3743 21 20.9549 20.4194 20.9549 19.6935V4.27742C21.013 3.58065 20.4323 3 19.7065 3ZM8.35491 18.3H5.71297V9.73548H8.35491V18.3ZM7.01942 8.54516C6.14846 8.54516 5.4807 7.84839 5.4807 7.00645C5.4807 6.16452 6.17749 5.46774 7.01942 5.46774C7.86136 5.46774 8.55813 6.16452 8.55813 7.00645C8.55813 7.84839 7.91942 8.54516 7.01942 8.54516ZM18.371 18.3H15.7291V14.1484C15.7291 13.1613 15.7001 11.8548 14.3356 11.8548C12.942 11.8548 12.7388 12.9581 12.7388 14.0613V18.3H10.0968V9.73548H12.6807V10.9258H12.7097C13.0872 10.229 13.9291 9.53226 15.2356 9.53226C17.9356 9.53226 18.4291 11.2742 18.4291 13.6548V18.3H18.371Z" fill="#343C54"/>
                        </svg>
                    </a>
                        
                    <a href="https://github.com/johnglensiy" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 group">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
                        <path className="group-hover:fill-blue-600 transition-colors" d="M12 2.24902C6.51613 2.24902 2 6.70064 2 12.249C2 16.6361 4.87097 20.3781 8.87097 21.7329C9.3871 21.8297 9.54839 21.5071 9.54839 21.2813C9.54839 21.0555 9.54839 20.4103 9.51613 19.5393C6.74194 20.1845 6.16129 18.1845 6.16129 18.1845C5.70968 17.0555 5.03226 16.7329 5.03226 16.7329C4.12903 16.0877 5.06452 16.0877 5.06452 16.0877C6.06452 16.12 6.6129 17.12 6.6129 17.12C7.48387 18.6684 8.96774 18.2168 9.51613 17.9264C9.6129 17.2813 9.87097 16.8297 10.1613 16.5716C7.96774 16.3458 5.6129 15.4748 5.6129 11.6684C5.6129 10.5716 6.03226 9.70064 6.64516 9.02322C6.54839 8.79741 6.19355 7.76515 6.74194 6.37806C6.74194 6.37806 7.6129 6.11999 9.51613 7.41031C10.3226 7.18451 11.1613 7.05548 12.0323 7.05548C12.9032 7.05548 13.7742 7.15225 14.5484 7.41031C16.4516 6.15225 17.2903 6.37806 17.2903 6.37806C17.8387 7.73289 17.5161 8.79741 17.3871 9.02322C18.0323 9.70064 18.4194 10.6039 18.4194 11.6684C18.4194 15.4748 16.0645 16.3458 13.871 16.5716C14.2258 16.8942 14.5484 17.5393 14.5484 18.4426C14.5484 19.7974 14.5161 20.8619 14.5161 21.1845C14.5161 21.4426 14.7097 21.7329 15.1935 21.6361C19.129 20.3135 22 16.6039 22 12.1845C21.9677 6.70064 17.4839 2.24902 12 2.24902Z" fill="#343C54"/>
                        </svg>
                    </a>
                    
                    <a href="/johnglensiy_resume_swe_jan2026.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 group">
                        <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
                        <path className="group-hover:fill-blue-600 transition-colors" d="M13.3507 14.4422C13.3507 14.452 13.3509 14.4618 13.3513 14.4714V15.7696C13.3513 16.5024 12.7572 17.0965 12.0243 17.0965C11.2915 17.0965 10.6974 16.5024 10.6974 15.7696V7.65429C10.6974 7.24008 10.3616 6.90429 9.9474 6.90429C9.53319 6.90429 9.1974 7.24008 9.1974 7.65429V15.7696C9.1974 17.3309 10.4631 18.5965 12.0243 18.5965C13.5856 18.5965 14.8513 17.3309 14.8513 15.7696V6.15429C14.8513 6.14353 14.8511 6.13283 14.8506 6.12217C14.8336 3.84265 12.9804 2 10.6968 2C8.40272 2 6.54297 3.85976 6.54297 6.15388V14.4422C6.54297 14.4492 6.54306 14.456 6.54325 14.4629V16.5192C6.54325 19.5462 8.99709 22 12.0241 22C15.051 22 17.5049 19.5461 17.5049 16.5192V9.55775C17.5049 9.14354 17.1691 8.80775 16.7549 8.80775C16.3407 8.80775 16.0049 9.14354 16.0049 9.55775V16.5192C16.0049 18.7177 14.2226 20.5 12.0241 20.5C9.82552 20.5 8.04325 18.7177 8.04325 16.5192V9.55775C8.04325 9.55085 8.04315 9.54397 8.04297 9.53711L8.04297 6.15388C8.04297 4.68818 9.23115 3.5 10.6968 3.5C12.1625 3.5 13.3507 4.68818 13.3507 6.15388L13.3507 14.4422Z" fill="#343C54"/>
                        </svg>
                    </a>
                </div>

                <nav className="flex flex-col my-auto gap-2">
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
                </nav>
                <div className="mt-auto mb-16">
                    <ViewCount initialViews={67}/>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex gap-25 w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-slate-50 text-black sm:items-start">
                {trackedSectionIDs.map((s: string, index: number) => (
                    <div key={s} id={s} ref={observers[index].ref}>
                        {children[index]}
                    </div>
                ))}
            </main>
        </div>
    )

}
