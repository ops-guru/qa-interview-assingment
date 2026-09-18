# Principal Quality Architect — Take-home exercise

**Build confidence for a launch. Establish the foundations of a QA practice.**

Target **60 minutes**; stop at **90 minutes**, including setup and reading. Incomplete work is welcome: explain what you prioritized, what remains, and what you would do next. Extra tests, presentation polish, and additional features do not earn extra credit.

## Your situation

You are the first Principal Quality Architect in a consultancy building its QA / Quality Engineering practice. Your first engagement has three development squads modernizing a policy platform, with a web application in front of a monolith and new services.

You inherit 4,000 automated tests taking three hours. About 15% fail on a typical run; the causes have not been established. Squads rerun until green, use inconsistent approaches, and have no performance-testing practice. Launch is in five months, with an expected 10× renewal-day traffic spike. Your first client steering committee is in two weeks.

You need to improve this engagement and develop an approach other consultants can reuse.

## What to submit

**1. A small runnable proof of concept**

- Write **two automated tests** against the supplied API. Choose the behaviors that best demonstrate your judgment; explain your choice. A third test is optional.
- Provide one command that runs the tests, reports results, and exits unsuccessfully when a test fails. Console or TAP output is sufficient; no CI platform configuration is required.
- Write one runnable load or spike script showing a baseline, a 10× step increase, and recovery. For the local demonstration, use a synthetic baseline of at most one renewal workflow per second, rise to at most ten, and finish within 30 seconds. Include basic timing and error results. Explain your workload choice and the limits of this demonstration.

Use your preferred language and tools. API tests are sufficient; there is no UI to build. The supplied server needs Node.js 22 or later and has no package dependencies. Do not build a framework or modify the service.

**2. A decision note — at most 600 words**

Bullets and tables are welcome. Address:

- **Diagnosis:** your two highest-priority concerns in the supplied test and performance evidence. Separate observations from hypotheses and name the next evidence you would obtain.
- **Delivery:** priorities for the first two weeks and the outcomes you would aim for by days 30, 60, and 90. Identify sequencing, ownership, and one deliberate deferral.
- **Quality approach:** what runs at pull request, integration/staging, and deployment/production stages; how test layers, shared tooling, and squad ownership fit together. Include how you would reduce regression time.
- **Performance and client decision:** what “10×” still needs to mean, your proposed measurable acceptance criteria, and your next performance experiment. Include a two-sentence message to the client VP about readiness and the decision or support you need.
- **Practice building:** one repeatable starter offering—who needs it, its scope and boundaries, reusable assets, and how you would demonstrate business value.

**3. Run instructions, AI practice, and a short disclosure**

Outside the word limit. Include commands, runtime/dependencies, time spent, and unfinished work. AI use is allowed; paid tools are not required.

**How you used AI here.** Answer three questions directly:

- Name one thing AI produced that you rejected or corrected, and why.
- Which claim in your decision note are you least confident in?
- What did you verify by running it, versus accept on faith?

**The AI system you would build for this engagement — at most 250 words.** Three squads use inconsistent approaches, and about 600 of 4,000 tests fail for unestablished reasons. You have one engineer at roughly half their time. Describe:

- What you would standardize as a reusable asset—skill, prompt, agent, template, or checklist—and where it lives so three squads stay consistent.
- Where AI is allowed to act, where it only proposes, and which decisions never go to AI.
- Your guardrails: how you detect AI output that looks correct but is not, specifically a test that passes for the wrong reason.
- How you would know the system is working after 60 days.

Attach real artifacts if you have them and they are shareable. This is optional; redact anything client-specific. Volume earns no credit—we read them as context for the interview.

## Getting started

Read `CASE.md` and `API.md`, then run:

```sh
npm start
```

The service runs at `http://127.0.0.1:4317`. Put your work in `submission/`, which contains an optional decision-note template. Return this folder as a ZIP with your additions; exclude installed dependencies.

Suggested time allocation: 10 minutes reading/triage, 20 minutes automated tests, 10 minutes spike script, and 20 minutes decision note. If setup blocks you, stop troubleshooting after ten minutes and document it.

We assess technical judgment, maintainable automation, quality architecture, performance reasoning, and the ability to turn delivery into a repeatable client service. We will discuss your submission and a small requirement change during the technical interview.
