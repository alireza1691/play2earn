"use client"
import React, { useState } from 'react'

export default function BattleLogTabs() {

    const [activeTab , setActiveTab] = useState< typeof battleLogTabs[number]>("All")
    let battleLogTabs = ["All", "Ongoing", "Attacks", "Defenses"];
  return (
    <div className=" flex flex-row w-full justify-center gap-4">
              {battleLogTabs.map((tab, key) => (
                <a
                onClick={() => setActiveTab(tab)}
                  className={` ${
                    activeTab == tab
                      ? "bg-gradient-to-t from-[#213830]/50 to-[#5ECFA4]/50"
                      : " bg-[#555555]/60"
                  } py-2 px-4 rounded-full cursor-pointer hover:brightness-110 transition-all`}
                  key={key}
                >
                  {tab}
                </a>
              ))}
            </div>
  )
}
