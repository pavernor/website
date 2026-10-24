---
title: "Why we build evals before features"
date: "2026-10-02"
category: "Ideas"
excerpt: "A demo that wows once tells you nothing. The eval suite is the real product spec for an agent — here's how we think about it."
author: "Alvin"
---

Every agent project has a moment of magic: the first run where the model reads your data, calls the right tool, and finishes the task. It feels like the work is done.

It isn't. The demo worked **once**.

## An agent without evals is a rumor

We treat the evaluation suite as the actual specification:

- **Golden tasks** — real workflows with expected outcomes, not toy prompts.
- **Trajectory checks** — did the agent use the right tools in the right order, or get lucky?
- **Guardrails** — what must never happen, encoded as tests that fail loudly.
- **Cost and latency budgets** — because a correct answer that costs 40× is still a failure.

## What this means in practice

Before we ship anything, the eval suite runs on every change. The question shifts from *"did it work this time?"* to *"does it pass, every time, within budget?"*

That's the difference between a prototype and a system you can delegate real work to.