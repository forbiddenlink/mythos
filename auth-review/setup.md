# Authentication setup decision

No authentication setup is required for the current Mythos app. Keep public reading and browser-local learning state.

| Configuration                                             | Current requirement                                             |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| Auth provider / auth library                              | None                                                            |
| Google OAuth client ID or secret                          | None                                                            |
| GitHub OAuth client ID or secret                          | None                                                            |
| OAuth callback routes / redirect URIs                     | None implemented; do not register guessed `/auth/callback` URLs |
| Auth site URL / redirect allowlist                        | None                                                            |
| OAuth scopes, consent-screen test users                   | Not applicable                                                  |
| Session signing/encryption secret                         | None                                                            |
| User database or auth migrations                          | None                                                            |
| Local / preview / staging / production auth configuration | None                                                            |

No example environment changes were needed. Existing optional service keys remain governed by `apps/web/.env.example`; they do not configure reader accounts. `apps/web/.env.local` is ignored by Git. Do not paste secrets into chat or put server credentials in `NEXT_PUBLIC_*` variables.

If cross-device learning sync becomes a requirement, design it as one feature with supported authentication, private per-user storage, explicit local-data import, deletion/export and verified server authorization. Choose the account provider before deriving callback URLs from its SDK. Google and GitHub can then be evaluated together with secure linking behavior. That future capability is not implemented or promised by this review.

Remaining action for the user: **none**. Google/GitHub login is intentionally absent, not blocked by missing credentials.
