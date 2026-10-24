---
title: "The 15/15 Illusion: Auditing a Browser Agent Against State of the Art"
date: "2026-10-17"
category: "Engineering"
excerpt: "Our browser agent scored 15/15 on its integration test. An internal audit proved it was grading its own homework. Here is an honest post-mortem and our architectural roadmap to late-2026 SOTA."
author: "Alvin"
---

When an autonomous browser agent passes 100% of its integration tests on the first try, you shouldn't celebrate. You should get suspicious.

The web is messy, dynamic, and hostile to automation. Pages hydrate asynchronously, selectors drift across framework builds, modals hijack pointer events, and multi-step wizards drop state without warning. A clean sweep in automated browser testing usually doesn't mean you've solved web autonomy. It means your test suite is grading its own homework.

Earlier this week, we ran an architectural audit on `hermes-agent` — our browser automation agent designed for structured applicant portals and complex web forms. We also benchmarked its underlying architecture against the late-2026 State of the Art (SOTA), surveying systems like `browser-use`, Playwright MCP, Skyvern, and frontier evaluations like FormFactory and WorkArena++.

The audit confirmed what our gut told us: **the 15/15 test score on `mock-form.html` was an illusion**. 

The fixture had been written with the exact literal trigger strings of the planner's heuristics, the test imported the heuristic planner directly, and the agent was silently swallowing fatal submission errors while reporting unqualified success.

Here is the full post-mortem: what broke, what modern browser agents actually do, and why fixing your evaluation oracle must always come before improving your agent.

---

## 1. Anatomy of a Circular Test

The circularity began with the test fixture itself (`mock-form.html`):

```html
<!-- Inside mock-form.html -->
<label for="first-name">First Name</label>
<input id="first-name" type="text" />

<!-- Inside planner.ts -->
const blob = `${label} ${name} ${placeholder} ${ariaLabel}`.toLowerCase();
if (blob.includes("first name")) return profile.firstName;
```

Every single field in the fixture was a verbatim echo of the planner's heuristic table:
- `<label>First Name</label>` triggered `first name`.
- `<label>Email Address</label>` triggered `email`.
- The legal prompt `<legend>Are you legally authorized to work in this country?</legend>` matched `authorized` and `legally`.
- Radio inputs carried literal `value="yes"` and `value="no"` attributes, triggering an internal fast-path (`val === 'yes'`) that bypassed semantic parsing.
- Select elements contained options matching profile JSON keys verbatim (`<option value="Immediate">` vs `"noticePeriod": "Immediate"`).

Worse, the test runner imported `heuristicPlan` directly. Because the heuristic ran in isolation, **the LLM planner (`createExecutionPlan`), custom combobox drivers, iframe traversals, shadow DOM handlers, overlay dismissals, and wizard loops were never invoked by any test**.

Finally, the verification oracle was trivial: it simply asserted that `#status` had `display: block` inside a local `preventDefault()` handler. No network requests were intercepted. No backend received a payload. 

The test didn't prove the agent could fill web forms. It proved that a hardcoded lookup table can navigate a webpage custom-tailored to that lookup table.

---

## 2. Four Production Bugs the Mock Completely Hid

Because the test environment was completely sterile, it concealed critical real-world failure modes:

### Bug 1: The Multi-Step Black Hole (Forms Died at Step 1)
Modern Applicant Tracking Systems (ATS) like Workday, Greenhouse, and Lever are multi-page wizards: Personal Info &rarr; Experience &rarr; Questions &rarr; Review &rarr; Submit. 

In `hermes-agent`, both entry points executed a single pass of `inspect -> plan -> execute`. The string `"next"` only existed inside an LLM system prompt. While the inspector collected `isMultiStep` and `stepText` flags, downstream code never consumed them. The agent literally never clicked a "Next" button. Against a real multi-page ATS, the workflow was dead on page 1.

### Bug 2: Silent Abort via Auto-Dismissed Dialogs
Under Playwright's default behavior, native browser dialogs (`window.confirm()`, `window.alert()`) are [automatically dismissed](https://playwright.dev/docs/api/class-dialog) unless an explicit `page.on('dialog')` handler is registered. 

When a form triggers a standard confirmation prompt — `confirm("Are you sure you want to submit?")` — Playwright dismisses it immediately. The submission is cancelled, no network request is dispatched, no error is thrown, and the agent cheerfully logs `success: true`.

### Bug 3: Optimistic Execution Reporting
The executor unconditionally pushed `{ success: true }` without verifying DOM state post-action:
- When encountering an `<input type="date">` for a start date, the planner sent the string `"Immediate"`. The browser rejected the value silently. The executor reported success.
- Combobox fallback used an unverified "Enter-gamble" (typing text and blindly pressing `Enter`), immediately reporting success even when no dropdown item was selected.
- If a Chrome DevTools Protocol (CDP) connection to an existing authenticated session failed, the driver silently spawned a fresh, unauthenticated browser window.

### Bug 4: First-Match-Wins Ordering Traps
The heuristic planner concatenated attributes into an unweighted string blob:

```typescript
const blob = `${element.label || ''} ${element.name || ''} ${element.placeholder || ''}`.toLowerCase();
```

Because it relied on sequential `if/else` checks without confidence scores or tie-breaking:
- A field labeled `"City/Country"` fell into the `city` branch because `city` was evaluated before `country`.
- A textarea prompting `"State your career objective"` matched the US `state` dropdown branch.
- A field named simply `"Name"` failed matching entirely, because the heuristic looked for `includes('full name')` or strict equality `=== 'name'`, which was broken by whitespace normalization.

---

## 3. The Late-2026 SOTA Landscape

How do production-grade autonomous browser agents handle these problems today? 

We conducted an architectural comparison against modern systems:

| Dimension | SOTA Practice (October 2026) | Prototype Condition | Architectural Gap |
|---|---|---|---|
| **Perception** | **Filtered Accessibility Tree with stable refs** (`Playwright MCP` `e12`/`f1e12`; `browser-use` CDP `backend_node_id`). Open shadow DOM pierced via `getByRole`. Paint-order filtering discards obscured overlays. Candidate pruning of 25–50&times; ([Prune4Web](https://arxiv.org/abs/2511.21398)). | Single `querySelectorAll` sweep per frame. Flat list without form scoping (search bars and newsletter inputs captured). No shadow DOM pierce. Invisible custom comboboxes. | **Fundamental:** Pre-2024 attribute heuristic vs. modern semantic tree grounding. |
| **Action Resilience** | **Self-healing locators with weighted similarity** (Similo: 91.3% base, 95.0% with LLM rerank). Explicit confidence thresholds (mabl/Healenium). Keyboard-first W3C ARIA APG drivers. | Single hardcoded fallback. Fixed sleep timeouts instead of state settling. Fragile `nth-of-type` selectors. Positional frame indexing that silently drops to main page. | **Major:** A single DOM hydration or client re-render breaks the action sequence. |
| **Planning & Orchestration** | **Structured Zod outputs + failure-adaptation memory**. Skyvern contextual JSON resume matching. LLM + fallback per field rather than global degradation. | ~650 lines of sequential substring matching. LLM output unvalidated (`JSON.parse` without schema). Entire raw PII profile sent to LLM endpoint. | **Major:** The LLM is a bolt-on ornament rather than an integrated reasoning engine. |
| **Multi-Step Execution** | **Iterative observation-action loop** with fresh snapshots per step. Next vs. Submit disambiguation. Explicit settle triggers (`waitForResponse`, `waitForURL`). | Single-pass sweep. Multi-step flags collected by inspector but ignored by executor. Never clicks "Next". | **Fatal for Domain:** Zero completion on multi-page ATS forms. |
| **Verification & Recovery** | **Post-action read-back assertions** (`input.value`, `aria-expanded`). Explicit `page.on('dialog')` handling. Deterministic ref expiration ("Ref not found"). Escalation on unknown fields. | Unconditional `success: true`. Submission inferred from input flags. Unhandled confirm dialogs abort submissions silently. | **Fatal for Trust:** The agent cannot differentiate completed actions from silent failures. |
| **Evaluation Integrity** | **Deterministic state/HAR interceptor verification**. Non-circular task generation with frozen seeds (WorkArena++). Agentic Benchmark Checklist (ABC) audits. | Single-pass console script. Handcrafted circular fixture. 9/15 assertion gate. Zero CI, zero flakiness testing, zero adversarial cases. | **Non-Comparable:** Test metrics measured nothing relevant to production deployment. |

### Why the Accessibility Tree Won
Modern agents no longer feed raw HTML to LLMs. A single complex React form field can span 100+ lines of nested `<div>` elements, wrapper styles, and synthetic event listeners. 

When converted to an **Accessibility Tree Snapshot** (`page.ariaSnapshot()` in Playwright or CDP AXTree), that same field collapses into two clean semantic lines:

```yaml
- combobox "Country of Residence" [expanded=false]:
  - textbox "Search country..."
```

Playwright's `getByRole` automatically pierces open Shadow DOM, resolves accessible names from `<label>` and `aria-labelledby`, and natively tracks interactive state. Combined with stable refs, token consumption drops by **40–60%**, and hallucinations plummet.

### The Mathematics of Self-Healing
Selectors break. Academic research on automated test maintenance shows that **73.6% of test breakage stems from brittle locators** ([Leotta et al.](https://dl.acm.org/doi/pdf/10.1145/2950290.2950294)).

Modern resilience relies on **Similo-style multi-attribute fingerprinting**:
- When an element is successfully targeted, store a fingerprint: `tag`, `type`, `name`, `aria-label`, `placeholder`, `text`, `parent hierarchy`, and bounding box.
- If the primary locator fails on a subsequent run, compute a weighted similarity score across all candidates.
- Published empirical benchmarks demonstrate that weighted multi-attribute matching recovers **91.3%** of broken locators, rising to **95.0%** when an LLM reranks the top-10 candidates ([Wiley STVR](https://onlinelibrary.wiley.com/doi/full/10.1002/stvr.1893)).
- Crucially: **a self-healing engine must reject heals below a strict confidence threshold**. Industrial engines (like mabl and Healenium) cap their matching scores to prevent catastrophic false positives — such as accidentally clicking "Cancel Application" or "Delete" when trying to locate "Submit".

---

## 4. The Industry Reality: Why We Don't Fight `browser-use`

A common temptation after an audit like this is to pivot toward building a "general web agent" to climb benchmarks like WebArena or WebVoyager.

That is a strategic mistake.

The frontier benchmarks paint a sobering picture of general-purpose web automation:
- **Form-Filling is Hard:** On the **FormFactory** benchmark (evaluating multimodal LLMs on complex web forms), **no frontier model exceeds 5% accuracy**.
- **Composite Enterprise Tasks are Unsolved:** On **WorkArena++** (ServiceNow enterprise workflows), frontier models score between **0% and 3%** on composite multi-step tasks, compared to a 93.9% human baseline.
- **Applicant-Side Portals are an Untouched Niche:** There is currently **zero standard academic benchmark** covering applicant-side job application flows.

General web agents like `browser-use` optimize for open-ended web browsing across unpredictable sites. But applicant portals are structured, repetitive, and high-consequence.

```
┌────────────────────────────────────────────────────────┐
│ The Winning Wedge for Hermes                           │
│                                                        │
│  1. Deterministic API Pre-computation (e.g. Greenhouse)│
│  2. Playwright-Native APG Widget Drivers               │
│  3. Human-in-the-Loop Review (Never Blind Auto-Submit) │
│  4. Local Non-Circular Verification Oracle             │
└────────────────────────────────────────────────────────┘
```

Consider the ATS ecosystem:
- **Greenhouse:** Exposes a public Job Board API (`questions` array). An agent can pre-fetch the exact schema, required fields, and custom questions before ever launching a browser. When navigating the DOM, the primary obstacle is the Google Places widget, which requires selecting an autocomplete suggestion to populate hidden lat/long inputs.
- **Workday:** Characterized by authenticated candidate portals, knockout questions, and multi-page wizards. The commercial market has decisively converged on **"review-first autofill"** — filling deterministic fields (education, contact info, standard work history) while escalating screening questions to a human operator.
- **LinkedIn Easy Apply:** LinkedIn strictly prohibits third-party automation in its User Agreement. Autonomous submission risks permanent account restriction. The only defensible position is **fill-and-review**, where the human performs the final review and click.

Hermes does not need to beat generalist agents at booking flights or buying clothes on Amazon. Its defensible moat is to become the **most reliable fill-and-review engine for structured enterprise applicant portals**.

---

## 5. The Engineering Roadmap: Fix the Oracle First

When an evaluation system lies to you, every architectural change is blind guessing. Our roadmap follows a strict rule: **fix the measurement harness before improving the agent.**

```
[ P0: Honest Baseline & Oracle ]  (3–4 weeks)
  ├── P0.1: Honest Success Reporting & Read-Back Verification
  ├── P0.2: Interactive Wizard Loop (Next/Submit Disambiguation)
  └── P0.3: Non-Circular Seeded Local Benchmark Suite
         │
         ▼
[ P1: Perception, Grounding & Resilience ]  (4–6 weeks)
  ├── P1.1: Native a11y-Tree Snapshots (ariaSnapshot + Stable Refs)
  ├── P1.2: Similo-Style Self-Healing Locators (Threshold Gated)
  ├── P1.3: W3C ARIA APG Widget Drivers (React-Select, Comboboxes)
  └── P1.4: Strict Zod Schema Validation & Cloud PII Redaction
         │
         ▼
[ P2: ATS Specialization & Efficiency ]  (4–6 weeks)
  ├── P2.1: Greenhouse API Pre-computation & Workday Adapters
  ├── P2.2: Bulk Typed-Field Actions (-74% Tool Calls, -57% Latency)
  └── P2.3: Systematic DOM Mutation Stress-Harness
```

### P0.1: Honest Success Reporting
Before touching perception or LLM prompts, we must make failures loud:
1. **Post-Action Read-Back:** Assert `input.value`, `checkbox.checked`, and `aria-expanded` after every action. If the DOM didn't mutate, return `{ success: false, reason: 'VALUE_NOT_REFLECTED' }`.
2. **Explicit Dialog Management:** Register `page.on('dialog')` immediately on browser launch. Handle or escalate confirmation prompts instead of letting Playwright drop them silently.
3. **True Submission Verification:** Submission success must be validated via network response codes (HTTP 200/201 on the submission endpoint) or confirmed URL redirection — never from the presence of a button click or a client-side `#status` flag.

### P0.2: The Wizard Execution Loop
Replace the single-pass sweep with an interactive loop:
```
Observe Page State ──► Plan Step Actions ──► Execute with Read-Back
        ▲                                             │
        │                                             ▼
Wait for Network Settle ◄── Click "Next" ◄── Verify Current Page Complete
```
- Disambiguate "Next" vs "Submit" via accessible name and form role.
- Wait for explicit settle conditions (`waitForResponse` or URL transition) rather than arbitrary `setTimeout` sleeps.
- Detect CAPTCHA and validation errors, pausing execution and handing off to the user.

### P0.3: Non-Circular Benchmark Suite
Synthesizing the lessons of WorkArena++ and WebArena-Verified:
- **Parameterized Form Generator:** Generate test forms using a deterministic seed (`task = template + seed`). Varied field order, optional vs required constraints, conditional sections, and date/phone validation rules.
- **Frozen Eval Seeds:** Freeze evaluation seeds completely separate from tuning seeds to prevent heuristic overfitting.
- **Real Component Libraries:** Build fixtures with actual enterprise UI libraries (React-Select, Material UI, Tailwind forms), not sterile HTML.
- **Adversarial & Infeasible Cases:** Include missing profile fields (agent must flag, not hallucinate) and impossible tasks where the correct answer is refusal.
- **Network HAR Oracles:** Grade submissions by intercepting the final POST request payload and validating normalized JSON data.

---

## 6. What We Don't Know (Epistemic Transparency)

Rigorous engineering requires knowing the limits of your research:
- **Small-Sample ATS Data:** Publicly reported accuracy numbers for commercial tools (e.g., Simplify's ~90% on Greenhouse vs ~70% on Workday) come from small-sample, single-source studies. They are indicative, not statistically definitive.
- **Vendor Codebase Opacity:** ATS platforms do not publish their internal widget implementation roadmaps. Real-world resilience requires continuous monitoring against live vendor DOM updates.
- **Ethical Testing Boundaries:** There is no published standard for rate limits and compliance when testing automated agents against live production websites. For hermes, **all continuous regression testing will remain 100% local on self-hosted fixtures**, reserving live runs for opt-in, human-supervised testing on personal accounts.

---

## The Takeaway

Building an agent that navigates a happy path on a toy form takes a weekend. Building an agent that can be trusted with your real data across real-world enterprise forms takes an uncompromising commitment to evaluation integrity.

A 15/15 test pass on a rigged test is a liability. A 6/15 score on a non-circular, adversarial evaluation suite is an honest engineering baseline.

We are beginning execution on **P0.1** today. When the evaluation oracle tells the truth, every unit of engineering effort actually moves the needle.
