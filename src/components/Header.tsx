import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
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
              href="/" 
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
          <li>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
