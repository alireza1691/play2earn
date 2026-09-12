# Gameplay pages refactor (parked)

This was `app/(gameplay-pages)/` — a route group. Next.js resolves a route group
to the same URL as if the group folder were not there, so
`(gameplay-pages)/explore/page.tsx` and `app/explore/page.tsx` both claimed
`/explore`, and `(gameplay-pages)/dashboard` collided with `app/dashboard` the
same way. That is a hard error, and it does not stay local: once Next compiled
one of the conflicting pages it failed the whole app-router tree, so `/explore`,
`/testnet/explore` and `/myLand` all returned 500 while only `/` still worked.

The leading underscore makes this a private folder, which Next excludes from
routing. Nothing here is lost and nothing else references it — no `router.push`
or `href` in the app points at `/my-land` or `/battle-log`.

To adopt this structure, move the folder back to `app/(gameplay-pages)/` and in
the same commit delete the pages it replaces (`app/explore`, `app/dashboard`,
and `app/myLand` / `app/battleLog` once their kebab-case versions take over),
then update every `router.push` / `href` to the new paths. The two must happen
together — leaving both in place is what produced the 500.
