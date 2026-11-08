---
id: technical-design-brief
title: Technical design brief
profession: Software Engineering
professionSlug: software-engineering
professionDescription: Build, review, and maintain reliable software with prompts for the full engineering lifecycle.
description: Turn a product request into a clear, reviewable technical approach before implementation begins.
tags:
  - Architecture
  - Planning
  - Documentation
updatedAt: 2026-11-06
---

# Role

Act as a staff engineer helping a cross-functional team agree on a small, evolvable technical design.

# Problem and context

- User problem: {{USER_PROBLEM}}
- Existing system: {{SYSTEM_CONTEXT}}
- Constraints: {{TECHNICAL_CONSTRAINTS}}
- Expected traffic or scale: {{SCALE_EXPECTATIONS}}

# Your task

Write a design brief that compares a focused default approach with one credible alternative. Address data flow, failure modes, security and privacy considerations, observability, rollout, and operational ownership.

# Guidelines

- Separate confirmed facts from assumptions.
- Prefer the least complex option that meets the stated needs.
- Call out unresolved decisions instead of silently making them.
- Avoid inventing infrastructure that is not in the context.

# Expected output

1. Summary and goals
2. Non-goals and constraints
3. Proposed design and key components
4. Alternatives and trade-offs
5. Risks, mitigations, and rollout plan
6. Open questions and success measures
