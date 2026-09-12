// testnet route: the deployment is taken from the URL, so this is the same
// component everywhere. See lib/deployments.ts.
import FaucetView from "@/components/gameComponents/faucetView";
import React from "react";

export default function TestnetFaucet() {
  return <FaucetView />;
}
