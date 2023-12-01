"use client"
import Questions from '@/components/askedQ'
import Footer from '@/components/footer';
import Intro from '@/components/intro'
import Roadmap from '@/components/roadmap'
import SideBar from "@/components/sideBar";
import Starter from '@/components/starter'
import FAQ from '@/components/faq';
import Carousel from '@/components/carousel';

export default function Home() {
  return (
    <main className="flex flex-col pt-[7rem]">
      <SideBar/>
      <Intro/>
      <Starter/>
      <Carousel/>
      <Roadmap/>
      {/* <Questions/> */}
      <FAQ/>
      <Footer/>

    </main>
  )
}
