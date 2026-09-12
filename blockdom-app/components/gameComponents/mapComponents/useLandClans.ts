"use client";
import { useApiData } from "@/context/api-data-context";
import { fetchClansOf, NO_CLAN } from "@/lib/clans";
import { useDeployment } from "@/lib/deployments";
import { useAddress } from "@thirdweb-dev/react";
import { useEffect, useMemo, useState } from "react";

export type Relation = "mine" | "ally" | "enemy";

/**
 * Which lands belong to your clan.
 *
 * Membership is per *address*, so this resolves the distinct land owners rather
 * than one lookup per land — the map has 10.000 cells and a handful of owners.
 * The result is a relation function the map can call per cell.
 */
export function useLandClans() {
  const { mintedLands } = useApiData();
  const address = useAddress();
  const deployment = useDeployment();

  const [clanByOwner, setClanByOwner] = useState<Map<string, number>>(new Map());

  const owners = useMemo(() => {
    const distinct = new Set<string>();
    for (const land of mintedLands ?? []) {
      if (land.owner) distinct.add(land.owner.toLowerCase());
    }
    if (address) distinct.add(address.toLowerCase());
    return Array.from(distinct);
  }, [mintedLands, address]);

  // `owners` is a fresh array each time it is rebuilt, so key the effect on its
  // contents instead — otherwise every mintedLands refresh refetches.
  const ownersKey = owners.join(",");

  useEffect(() => {
    let cancelled = false;
    fetchClansOf(owners, deployment).then((result) => {
      if (!cancelled) setClanByOwner(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownersKey, deployment]);

  const myClan = address
    ? clanByOwner.get(address.toLowerCase()) ?? NO_CLAN
    : NO_CLAN;

  return useMemo(() => {
    const mine = address?.toLowerCase();

    /** How the connected wallet stands towards the owner of a land. */
    const relationTo = (owner: string): Relation => {
      const lower = owner.toLowerCase();
      if (mine && lower === mine) return "mine";
      if (myClan !== NO_CLAN && clanByOwner.get(lower) === myClan) return "ally";
      return "enemy";
    };

    return {
      myClan,
      relationTo,
      /** The contract refuses these outright; the UI should not offer them. */
      canAttack: (owner: string) => relationTo(owner) === "enemy",
      clanOfOwner: (owner: string) =>
        clanByOwner.get(owner.toLowerCase()) ?? NO_CLAN,
    };
  }, [clanByOwner, myClan, address]);
}
