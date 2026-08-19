# Admin Hub Data Entry Verification

The Admin Hub now maps the Data Entry sidebar items to distinct module states:

- **Monthly Marks** resolves to `monthlyMarks` and renders the fixed Monthly Marks form only.
- **Quarterly Marks** resolves to `quarterlyMarks` and renders the fixed Quarterly Marks form only.
- **Job Evolution** resolves to `jobEvolution` and renders the fixed Job Evolution form only.

The mappings are implemented in `shared/adminHub.ts`, consumed by `client/src/pages/Portal.tsx`, and covered by `server/adminHub.test.ts` and `server/adminHub.component.test.tsx`. The selected module is rendered in the right workspace while the sidebar remains the navigation source; the latest validation passed TypeScript, 45 deterministic tests, and the production build.

The authenticated browser click-through remains pending because Admin credentials were not supplied in the session. The source-level mapping and deterministic component contracts are the current evidence boundary.
