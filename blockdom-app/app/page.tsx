"use client"
import Questions from '@/components/indexPage/askedQ'
import Carousel from '@/components/indexPage/carousel'
import FAQ from '@/components/indexPage/faq'
import Footer from '@/components/indexPage/footer'
import Intro from '@/components/indexPage/intro'
import Roadmap from '@/components/indexPage/roadmap'
import SideBar from '@/components/indexPage/sideBar'
import Starter from '@/components/indexPage/starter'


export default function Home() {
 

  return (

    <main className="flex flex-col pt-[7rem]">
 
 
         <SideBar/>
      <Intro/>
      <Starter/>
       <Carousel/>
      <Roadmap/>
     <FAQ/>
     {/* <Questions/> */}
  <Footer/>
  </main>
  )
}
