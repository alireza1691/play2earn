"use client"
import Questions from '@/components/askedQ'
import Intro from '@/components/intro'
import Roadmap from '@/components/roadmap'

import Starter from '@/components/starter'
import TopBar from '@/components/topBar'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex flex-col ">
      <TopBar/>
      <Intro/>
      <Starter/>
      <Roadmap/>
      <Questions/>
    </main>
  )
}
