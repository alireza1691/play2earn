"use client"
import { useSelectedWindowContext } from '@/context/selected-window-context'
import { battleLogTabs } from '@/lib/data'
import React, { useState } from 'react'

export default function BattleLogTabs() {

  const {battleLogTab, setBattleLogTab} = useSelectedWindowContext()
    // const [activeTab , setActiveTab] = useState< typeof battleLogTabs[number]>("Ongoing")
    
  return (
    <div className=" flex flex-row w-full justify-center gap-4">
              {battleLogTabs.map((tab, key) => (
                <a
                onClick={() => setBattleLogTab(tab)}
                  className={` ${
                    battleLogTab == tab
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
