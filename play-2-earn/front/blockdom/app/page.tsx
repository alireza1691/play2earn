"use client"
import Intro from '@/components/intro'
import Roadmap from '@/components/roadmap'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="">
      <Intro/>
      <Roadmap/>
    </main>
  )
}
