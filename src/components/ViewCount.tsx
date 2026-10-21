'use client'
 
import incrementViews from '@/actions/incrementViews'
import getViews from '@/actions/getViews'
import { useState, useEffect, useTransition } from 'react'
 
export default function ViewCount({ initialViews }: { initialViews: number }) {
  const [views, setViews] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
 
  // Only trigger counter with unique visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      localStorage.setItem("hasVisited", 'true');
      startTransition(async () => {
        const updatedViews = await incrementViews();
        setViews(updatedViews);
      }) 
    } else {
      startTransition(async () => {
        const currViews = await getViews();
        setViews(currViews);
      })
    }
  }, [])
 
  // You can use `isPending` to give users feedback
  return (
    <p>
      You are the {views === null || isPending ? '...' : <span className='font-bold'>{views}th</span>} visitor of my website!
    </p>
  )
}