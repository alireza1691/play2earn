"use client";
import { useApiData } from "@/context/api-data-context";
import { useBlockchainUtilsContext } from "@/context/blockchain-utils-context";
import { useUserDataContext } from "@/context/user-data-context";
import {
  fetchAllClans,
  fetchClanRequests,
  fetchRequestedClan,
  ClanSummary,
  NO_CLAN,
} from "@/lib/clans";
import { useAddress } from "@thirdweb-dev/react";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLandClans } from "../mapComponents/useLandClans";
import { useDeployment } from "@/lib/deployments";

const MAX_MEMBERS = 20;

/** Shared so a clanless render does not hand the list a new array each pass. */
const NO_REQUESTS: string[] = [];

const short = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

/**
 * Clan roster.
 *
 * Clans live on the v4 contracts, which are not the ones deployed — so every
 * read here comes back empty against the live chain rather than throwing (see
 * lib/clans.ts). The page renders the "no clans yet" state in that case, and
 * starts working on its own once v4 is live.
 */
export default function ClansContainer() {
  const address = useAddress();
  const deployment = useDeployment();
  const { ownedLands } = useUserDataContext();
  const { myClan } = useLandClans();
  const { setApiTrigger } = useApiData();
  const {
    createClan,
    inviteToClan,
    joinClan,
    leaveClan,
    kickFromClan,
    transferClanLeadership,
    requestToJoinClan,
    cancelClanRequest,
    approveClanRequest,
    rejectClanRequest,
  } = useBlockchainUtilsContext();

  const [clans, setClans] = useState<ClanSummary[] | null>(null);
  /** Applicants fetched for the clan I lead, kept from the last clan I had. */
  const [fetchedRequests, setFetchedRequests] = useState<string[]>([]);
  /** The clan I have applied to, if any. */
  const [myRequest, setMyRequest] = useState<number>(NO_CLAN);
  const [name, setName] = useState("");
  const [chosenFoundingLand, setFoundingLand] = useState("");
  const [invitee, setInvitee] = useState("");

  const reload = useCallback(() => {
    let cancelled = false;
    fetchAllClans(deployment).then((result) => {
      if (!cancelled) setClans(result);
    });
    fetchRequestedClan(address, deployment).then((result) => {
      if (!cancelled) setMyRequest(result);
    });
    if (myClan !== NO_CLAN) {
      fetchClanRequests(myClan, deployment).then((result) => {
        if (!cancelled) setFetchedRequests(result);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [deployment, address, myClan]);

  useEffect(() => reload(), [reload]);

  // Clearing the list from inside reload() was a synchronous setState for
  // something already implied by myClan: with no clan there is nobody to
  // approve, whatever the last fetch left behind.
  const requests = myClan === NO_CLAN ? NO_REQUESTS : fetchedRequests;

  const mine = useMemo(
    () => clans?.find((clan) => clan.id === myClan) ?? null,
    [clans, myClan]
  );
  const isLeader =
    !!mine && !!address && mine.leader.toLowerCase() === address.toLowerCase();

  // Founding is charged to a land, which must also hold the townhall level, so
  // the founder picks which of their lands pays for it. The default is read
  // straight off ownedLands rather than seeded into state by an effect — the
  // select is only ever showing one of the two.
  const foundingLand = chosenFoundingLand || ownedLands?.[0]?.tokenId || "";

  // A clan is what makes lands allies, so the contract refuses a member who
  // holds none — founding, an invitation and an application alike. Saying so
  // here saves the player a transaction that can only revert.
  const hasLand = !!ownedLands && ownedLands.length > 0;

  const after = async (action: Promise<void>) => {
    await action;
    setApiTrigger(true);
    reload();
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar px-4 pt-[7rem] pb-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header>
          <h2 className="blueText !text-[22px]">Clans</h2>
          <p className="text-[13px] text-white/60">
            Members of a clan cannot march on one another, and show as allies on
            the map. Up to {MAX_MEMBERS} to a clan.
          </p>
        </header>

        {!address && (
          <p className="greenBg p-4 text-[14px]">
            Connect your wallet to see your clan.
          </p>
        )}

        {address && myClan === NO_CLAN && (
          <section className="greenBg flex flex-col gap-3 p-4">
            <h3 className="lightGreen text-[16px]">Found a clan</h3>
            <p className="text-[13px] text-white/60">
              Costs 500 gold from the founding land, which needs a level 3
              townhall. You become its leader.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={foundingLand}
                onChange={(event) => setFoundingLand(event.target.value)}
                className="balBg flex-1 bg-transparent px-3 py-2 text-[14px]"
              >
                {(ownedLands ?? []).map((land) => (
                  <option
                    key={land.tokenId}
                    value={land.tokenId}
                    className="text-black"
                  >
                    Land {land.tokenId}
                  </option>
                ))}
              </select>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                placeholder="Clan name"
                className="balBg flex-1 bg-transparent px-3 py-2 text-[14px]"
              />
              <button
                className="greenButton !py-2"
                disabled={!name.trim() || !foundingLand}
                onClick={() =>
                  after(createClan(Number(foundingLand), name.trim()))
                }
              >
                Found
              </button>
            </div>
            {!hasLand && (
              <p className="text-[13px] text-[color:var(--pw-danger)]">
                You need a land before you can found or join a clan.
              </p>
            )}
          </section>
        )}

        {address && myClan === NO_CLAN && myRequest !== NO_CLAN && (
          <section className="greenBg flex items-center justify-between gap-3 p-4">
            <p className="text-[14px]">
              Application pending with{" "}
              <span className="lightGreen">
                {clans?.find((clan) => clan.id === myRequest)?.name ??
                  `clan #${myRequest}`}
              </span>
              . Its leader has to approve it.
            </p>
            <button
              className="outlineRedButton !py-1 !px-4 !text-[13px]"
              onClick={() => after(cancelClanRequest())}
            >
              Withdraw
            </button>
          </section>
        )}

        {mine && (
          <section className="greenBg flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="lightGreen text-[16px]">
                {mine.name}{" "}
                <span className="text-[13px] text-white/50">
                  ({mine.members.length}/{MAX_MEMBERS})
                </span>
              </h3>
              <button
                className="outlineRedButton !py-1 !px-4 !text-[13px]"
                onClick={() => after(leaveClan())}
                title={
                  isLeader && mine.members.length > 1
                    ? "Hand leadership over first"
                    : undefined
                }
                disabled={isLeader && mine.members.length > 1}
              >
                Leave
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {mine.members.map((member) => {
                const isMe =
                  !!address && member.toLowerCase() === address.toLowerCase();
                return (
                  <li
                    key={member}
                    className="logBg flex items-center justify-between px-3 py-2 text-[13px]"
                  >
                    <span>
                      {short(member)}
                      {member.toLowerCase() === mine.leader.toLowerCase() && (
                        <span className="lightGreen ml-2 text-[11px]">
                          leader
                        </span>
                      )}
                      {isMe && (
                        <span className="ml-2 text-[11px] text-white/50">
                          you
                        </span>
                      )}
                    </span>
                    {isLeader && !isMe && (
                      <span className="flex gap-2">
                        <button
                          className="outlineGreenButton !py-1 !px-3 !text-[12px]"
                          onClick={() =>
                            after(transferClanLeadership(member))
                          }
                        >
                          Make leader
                        </button>
                        <button
                          className="outlineRedButton !py-1 !px-3 !text-[12px]"
                          onClick={() => after(kickFromClan(member))}
                        >
                          Kick
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {isLeader && requests.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-[14px] text-white/70">
                  Requests to join ({requests.length})
                </h4>
                {requests.map((applicant) => (
                  <div
                    key={applicant}
                    className="logBg flex items-center justify-between px-3 py-2 text-[13px]"
                  >
                    <span>{short(applicant)}</span>
                    <span className="flex gap-2">
                      <button
                        className="greenButton !py-1 !px-3 !text-[12px]"
                        disabled={mine.members.length >= MAX_MEMBERS}
                        title={
                          mine.members.length >= MAX_MEMBERS
                            ? "The clan is full"
                            : undefined
                        }
                        onClick={() => after(approveClanRequest(applicant))}
                      >
                        Approve
                      </button>
                      <button
                        className="outlineRedButton !py-1 !px-3 !text-[12px]"
                        onClick={() => after(rejectClanRequest(applicant))}
                      >
                        Reject
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isLeader && requests.length === 0 && (
              <p className="text-[13px] text-white/40">
                No requests to join right now.
              </p>
            )}

            {isLeader && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={invitee}
                    onChange={(event) => setInvitee(event.target.value)}
                    placeholder="0x… address to invite"
                    className="balBg flex-1 bg-transparent px-3 py-2 text-[13px]"
                  />
                  <button
                    className="greenButton !py-2"
                    disabled={
                      !invitee.trim() || mine.members.length >= MAX_MEMBERS
                    }
                    onClick={() => after(inviteToClan(invitee.trim()))}
                  >
                    Invite
                  </button>
                </div>
                {/*
                  The contract checks land when the invitation is accepted, not
                  when it is sent, so an invite to an address with no land is
                  accepted here and then refused at the door. Said plainly
                  rather than paid for in Town's last few hundred bytes.
                */}
                <p className="text-[12px] text-white/40">
                  They need to hold a land to accept — clan membership is what
                  makes lands allies.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="lightGreen text-[16px]">All clans</h3>
          {clans === null && (
            <p className="text-[13px] text-white/50">Loading…</p>
          )}
          {clans !== null && clans.length === 0 && (
            <p className="text-[13px] text-white/50">
              No clans have been founded yet.
            </p>
          )}
          {clans?.map((clan) => (
            <div
              key={clan.id}
              className="logBg flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[15px]">
                  {clan.name}
                  {clan.id === myClan && (
                    <span className="lightGreen ml-2 text-[11px]">yours</span>
                  )}
                </p>
                <p className="text-[12px] text-white/50">
                  led by {short(clan.leader)} · {clan.members.length}/
                  {MAX_MEMBERS} members
                </p>
              </div>
              {address && myClan === NO_CLAN && (
                <span className="flex gap-2">
                  {/* Two ways in. Applying is the one open to anyone; Accept
                      only goes through if the leader already invited you, so it
                      is offered alongside rather than instead. */}
                  <button
                    className="outlineGreenButton !py-1 !px-4 !text-[13px]"
                    disabled={
                      !hasLand ||
                      myRequest !== NO_CLAN ||
                      clan.members.length >= MAX_MEMBERS
                    }
                    title={
                      !hasLand
                        ? "Clans are for landholders — mint a land first"
                        : myRequest !== NO_CLAN
                        ? "Withdraw your pending application first"
                        : clan.members.length >= MAX_MEMBERS
                        ? "This clan is full"
                        : undefined
                    }
                    onClick={() => after(requestToJoinClan(clan.id))}
                  >
                    Request to join
                  </button>
                  <button
                    className="outlineGreenButton !py-1 !px-4 !text-[13px]"
                    disabled={!hasLand}
                    onClick={() => after(joinClan(clan.id))}
                    title={
                      hasLand
                        ? "Only works if this clan's leader has invited you"
                        : "Clans are for landholders — mint a land first"
                    }
                  >
                    Accept invite
                  </button>
                </span>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
