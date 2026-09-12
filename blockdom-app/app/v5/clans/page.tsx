// v5 route: same pages and components as the live game, resolved against
// the rewritten contracts. See lib/deployments.ts — the deployment is
// taken from the URL, so nothing here differs but the path.
import ClansContainer from "@/components/gameComponents/clans/clansContainer";
import React from "react";

export default function V5TestnetClans() {
  return (
    <div className="overflow-hidden w-screen h-screen relative">
      <ClansContainer />
    </div>
  );
}
