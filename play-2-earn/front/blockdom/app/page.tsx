"use client"
import Questions from '@/components/askedQ'
import Footer from '@/components/footer';
import Intro from '@/components/intro'
import Roadmap from '@/components/roadmap'
import SideBar from "@/components/sideBar";
import Starter from '@/components/starter'
import FAQ from '@/components/faq';
import Carousel from '@/components/carousel';
import Error from './error';
import ErrorBoundary from '@/components/ErrorBoundary';


export default function Home() {
  return (
    <main className="flex flex-col pt-[7rem]">
      <ErrorBoundary fallback={"index page error"} >
      <SideBar/>
      <Intro/>
      <Starter/>
      <Carousel/>
      <Roadmap/>
   
      <FAQ/>
      <Footer/>
      </ErrorBoundary>
    </main>
  )
}
