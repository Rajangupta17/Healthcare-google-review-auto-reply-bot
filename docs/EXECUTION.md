# Execution runbook

## How a run works

| # | Node | What it does |
|---|---|---|
| 1 | Daily 9 AM / Manual test run | Schedule trigger (Asia/Kolkata) and a test button |
| 2 | Config | `mode` (test / live), `hospital_name`, `account_id`, `location_id` |
| 3 | Read_sheet | Review IDs already handled, so nothing is handled twice |
| 4 | Get_Review | Demo: sample reviews. Production: Google Business Profile API |
| 5 | Classify and decide | Words + tone → Reply / Exit, picks a reply, records the reason |
| 6 | Positive? | Splits Reply and Exit paths |
| 7 | Safety_check → Safe_only | Blocks prices, phone numbers, room numbers, medical words, bad length |
| 8 | Post_reply | Test: simulated. Live: posts on Google |
| 9 | Mark_result → Done – replied | Status + time |
| 10 | Exit – no reply | End of the non-positive path |
| 11 | Build_sheet_rows → Save to Excel → Done – report saved | One log row per review |

## Go-live path

| Stage | Setting | Exit criteria |
|---|---|---|
| Local demo | `mode = test`, demo reviews | All paths green |
| Shadow run | `mode = test`, real reviews | 2 weeks, ≥ 100 reviews, **0 wrong replies** (check the log daily) |
| Live | `mode = live` | Monthly spot-check of 20 replies; any wrong reply → back to `test` |

**Emergency stop:** set `mode = test`. Posting stops immediately.

## Connect Google

1. In Google Cloud, request **Business Profile API** access for your project. Approval shows as *Requests per minute* changing from **0 → 300** on the My Business APIs.
2. Enable: My Business Account Management API, My Business Business Information API, Google My Business API.
3. **Google Auth Platform:** External audience, app name, support email, scope `https://www.googleapis.com/auth/business.manage`, add your account as a test user. Do not upload a logo (it triggers verification).
4. **OAuth client:** Web application, redirect URI `http://localhost:5678/rest/oauth2-credential/callback`.
5. **n8n credential:** *OAuth2 API* · Authorization Code · auth URL `https://accounts.google.com/o/oauth2/v2/auth` · token URL `https://oauth2.googleapis.com/token` · scope as above · query params `access_type=offline&prompt=consent` · Authentication: Body → **Connect**.
6. Test hit: HTTP Request `GET https://mybusinessaccountmanagement.googleapis.com/v1/accounts` → note the account ID; list locations for the location ID; put both in `Config`.
7. Replace **Get_Review** with `GET https://mybusiness.googleapis.com/v4/accounts/{account}/locations/{location}/reviews?pageSize=50`.
8. Replace **Post_reply** with `PUT …/reviews/{reviewId}/reply`, body `{"comment": "{{ $json['Suggested reply'] }}"}`.
9. Publish the OAuth app (home page + privacy link) so the login does not expire every 7 days.

## Operations checklist

- Workflow **published** (the schedule only runs when published) and timezone set to Asia/Kolkata
- Host machine on at 9 AM, sleep disabled, n8n running
- `Executions` tab shows a green 9:00 run each day
- Weekly workflow backup (⋯ → Download)
- Secrets only in n8n Credentials, never in code, chat or screenshots; one active client secret

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `429` / quota on Google calls | API access not approved yet | Wait for 0 → 300 quota |
| `403 API not enabled` | An API is off | Enable the three APIs |
| `401` after a week | OAuth app still in Testing | Publish the app, reconnect |
| Save to Excel red | File open in Excel, or folder not allowed | Close the file; set `N8N_RESTRICT_FILE_ACCESS_TO` |
| "No file(s) found" on read | Leading space or wrong slashes in path | Clear the field, paste the path again |
| Same review handled twice | Read_sheet empty | Feed handled Review IDs from the log |
