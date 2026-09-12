import Slidebar from "@/components/gameComponents/landSlideBarComponents/landSlideBar";

import ExploreView from "@/components/gameComponents/mapComponents/exploreView";

export default function Explore() {
  return (
    <div className=" overflow-hidden w-screen h-screen relative">
      {/* <BattleLog /> */}
      <ExploreView />

      <div className=" flex flex-row justify-center">
        <Slidebar />
      </div>
    </div>
  );
}
