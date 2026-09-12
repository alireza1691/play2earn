// v4 route: same pages and components as the live game, resolved against
// the rewritten contracts. See lib/deployments.ts — the deployment is
// taken from the URL, so nothing here differs but the path.
import BattleLogContainer from '@/components/gameComponents/battleLog/battleLogContainer'
import React from 'react'

export default function V4BattleLog() {
  return (
    <div className=" overflow-hidden w-screen h-screen relative">
    <BattleLogContainer/>
    </div>
  )
}
