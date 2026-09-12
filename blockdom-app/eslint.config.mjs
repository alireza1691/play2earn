import next from "eslint-config-next/core-web-vitals";

/**
 * Flat config, because Next 16 removed `next lint` and the .eslintrc.json it
 * read; `npm run lint` now calls the ESLint CLI directly. Same rule set as
 * before — eslint-config-next/core-web-vitals.
 */
const config = [
  {
    // scripts/ is Node tooling that generates the map tiles, not app code, so
    // the browser and React rules do not apply to it.
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
    ],
  },
  ...next,
];

export default config;
