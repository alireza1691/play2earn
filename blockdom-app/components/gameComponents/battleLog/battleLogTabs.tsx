"use client"
import { useSelectedWindowContext } from '@/context/selected-window-context'
import { battleLogTabs } from '@/lib/data'
import React, { useState } from 'react'

export default function BattleLogTabs() {

  const {battleLogTab, setBattleLogTab} = useSelectedWindowContext()
    // const [activeTab , setActiveTab] = useState< typeof battleLogTabs[number]>("Ongoing")
    
  return (
    <div className=" flex flex-row w-full justify-center md:gap-4 gap-1">
              {battleLogTabs.map((tab, key) => (
                <button
                  onClick={() => setBattleLogTab(tab)}
                  data-active={battleLogTab == tab}
                  className="pwTab"
                  key={key}
                >
                  {tab}
                </button>
              ))}
            </div>
  )
}
