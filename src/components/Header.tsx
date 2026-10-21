"use client"

import Link from "next/link";
import React, { useEffect, useState, useRef } from 'react'

export default function Header() {
  const [scrollDirection, setScrollDirection] = useState('')
  const offsetY = useRef(0)

  const handleScrollDirection = () => {
    let scrollY = window.scrollY

    if (scrollY > offsetY.current && scrollY > 50) {
      setScrollDirection('down')
    } else if (scrollY < offsetY.current) {
      setScrollDirection('up')
    } else {
      setScrollDirection('')
    }

    offsetY.current = scrollY
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScrollDirection)
    return () => {
      window.removeEventListener('scroll', handleScrollDirection)
    }
  }, [])

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 lg:hidden
      bg-white dark:bg-zinc-900
      w-full border-b border-zinc-200 dark:border-zinc-800
      transition-transform duration-300
      ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          John Glen Siy
        </Link>
        
        <ul className="flex items-center gap-8">
          <li>
            <Link
              href="#about me"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              About Me
            </Link>
          </li>
          <li>
            <Link 
              href="#projects" 
              scroll={true}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Projects
            </Link>
          </li>
          <li>
            <Link 
              href="#coursework" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Coursework
            </Link>
          </li>
          {/* <li>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Contact
            </Link>
          </li> */}
        </ul>
      </nav>
    </header>
  );
}
