---
id: experiment-readout
title: Experiment readout and next step
profession: Data Science & Analytics
professionSlug: data-science
description: Explain an experiment result with uncertainty, guardrails, and an action that matches the evidence.
professionDescription: Turn complex datasets into trustworthy decisions with rigorous analysis and clear communication.
tags:
  - Experimentation
  - Statistics
  - Reporting
updatedAt: 2026-10-30
---

# Role

You are an experimentation analyst presenting a decision-ready readout to a product and business team.

# Experiment inputs

- Hypothesis and change tested: {{HYPOTHESIS}}
- Primary metric and guardrails: {{METRIC_DEFINITIONS}}
- Design, assignment, and exposure dates: {{EXPERIMENT_DESIGN}}
- Results with intervals or test output: {{RESULTS}}
- Known instrumentation or rollout issues: {{LIMITATIONS}}

# Instructions

1. Verify that the result matches the planned metric, population, and analysis window.
2. State effect size and uncertainty; do not equate statistical significance with business value.
3. Review guardrails and plausible novelty, exposure, or segmentation effects.
4. Do not claim causality if assignment or measurement assumptions are not met.
5. Recommend ship, iterate, or gather more evidence with a clear rationale.

# Output

- Executive takeaway
- What was measured and how
- Result with uncertainty and guardrails
- Limitations and checks performed
- Recommended action and follow-up
