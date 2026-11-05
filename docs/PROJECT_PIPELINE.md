# Project pipeline – Healthcare Google Review Auto-Reply Bot

## 1. End-to-end pipeline

```mermaid
flowchart LR
    subgraph P1["1 · Define"]
        A1["Problem:<br/>slow manual replies,<br/>risky naive bot"] --> A2["Rule:<br/>reply only if<br/>fully positive"]
    end
    subgraph P2["2 · Build"]
        B1["Self-hosted n8n<br/>auto-start"] --> B2["Workflow:<br/>read → decide →<br/>safety → reply → log"]
    end
    subgraph P3["3 · Train"]
        C1["Collect<br/>199 real reviews"] --> C2["Label<br/>Reply / Exit"] --> C3["Score in<br/>training node"] --> C4["Fix words +<br/>tone rules"] --> C3
    end
    subgraph P4["4 · Execute"]
        D1["9 AM schedule<br/>test mode"] --> D2["Google OAuth<br/>connected"] --> D3["API approval<br/>0 → 300"] --> D4["2-week<br/>shadow run"] --> D5["Live"]
    end
    subgraph P5["5 · Monitor"]
        E1["Excel log<br/>+ Executions"] --> E2["Monthly check<br/>20 replies"]
    end
    P1 --> P2 --> P3 --> P4 --> P5
    P5 -. new tricky reviews .-> P3
```

| Phase | Dates | Status |
|---|---|---|
| 1 · Define | Week 1 | ✅ Problem and rule agreed |
| 2 · Build | Week 1 | ✅ n8n installed, workflow built |
| 3 · Train | Week 1–2 | ✅ 199 real reviews, 0 wrong replies |
| 4 · Execute | Week 2 → | ✅ schedule, test mode, OAuth · ⏳ API approval, shadow run, live |
| 5 · Monitor | after go-live | ⏳ |

## 2. Daily run (9:00 AM IST)

```mermaid
flowchart LR
    A["⏰ Daily 9 AM"] --> B["Config<br/>mode test / live"]
    B --> C["Read_sheet<br/>already handled"]
    C --> D["Get_Review<br/>Google API"]
    D --> E["Classify and decide"]
    E --> F{"Positive?"}
    F -- yes --> G["Safety_check"] --> H["Safe_only"] --> I["Post_reply"] --> J["Mark_result"] --> K["Done - replied"]
    F -- no --> L["Exit - no reply"]
    E --> M["Build_sheet_rows"] --> N["Convert to File"] --> O["Save to Excel"] --> P["Done - report saved"]
```

## 3. How one review is decided

```mermaid
flowchart TD
    R["Review text<br/>EN / Hindi / Hinglish"] --> W{"Negative word<br/>or phrase?"}
    W -- yes --> X["Exit"]
    W -- no --> T{"Negative tone?<br/>but/lekin · CAPS · question ·<br/>please improve · sarcasm · worry"}
    T -- yes --> X
    T -- no --> P{"At least one<br/>positive word?"}
    P -- no --> X
    P -- yes --> S{"Safety check"}
    S -- fail --> X
    S -- pass --> Y["Reply in English<br/>1 of 100 templates"]
```

## 4. Training loop

```mermaid
flowchart LR
    A["Collect 30-50 reviews<br/>newest · 3-4 · Hinglish"] --> B["Label Reply / Exit"]
    B --> C["Training workflow:<br/>Execute step"]
    C --> D{"WRONG replies = 0<br/>accuracy ≥ 95%?"}
    D -- no --> E["Fix word lists"]
    E --> C
    D -- yes --> F["Update the brain<br/>in the main workflow"]
```

| Round | Reviews | Accuracy | Wrong replies |
|---|---|---|---|
| 1 | 55 | 100% | 0 |
| 2 | 145 | 99% | 1 → 0 |
| 3 | 201 | 97% | 2 → 0 |
| 4 (tone) | 214 | 97% | 0 |
| v6 | 199 real | 133 Reply / 66 Exit | 0 |

## 5. Go-live path

| Stage | Config | Exit criteria |
|---|---|---|
| Local test | `mode = test`, demo reviews | ✅ all paths green |
| Shadow run | `mode = test`, real Google reviews | 2 weeks, ≥ 100 reviews, 0 wrong replies (check Excel daily) |
| Live | `mode = live` | Monthly check of 20 replies; any wrong reply → back to test |

## 6. What changes at the API step

| Box | Now | After approval |
|---|---|---|
| Get_Review | 199 test reviews | `GET mybusiness.googleapis.com/v4/accounts/{a}/locations/{l}/reviews` |
| Post_reply | Simulated | `PUT …/reviews/{reviewId}/reply` |
| Config | IDs empty | account_id, location_id filled |
| Everything else | — | No change |
