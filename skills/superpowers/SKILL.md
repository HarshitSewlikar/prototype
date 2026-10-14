---
name: "superpowers"
description: >-
  Agentic software development methodology enforcing structured planning, test-driven
  development (TDD), systematic debugging, and strict verification gates.
---

# Superpowers: Agentic Development Methodology

Based on `obra/superpowers`. This skill governs software quality, disciplined testing, and verification procedures for the agent.

## Core Rules

1. **Test-Driven Development (TDD) First**
   - Write or update unit tests BEFORE altering business logic.
   - Run tests to watch them fail (Red).
   - Write minimal implementation to pass tests (Green).
   - Refactor for clarity and performance without altering behavior.

2. **Systematic Debugging Protocol**
   - Never apply speculative patches.
   - Locate the exact failure point through log tracing or test assertion.
   - Formulate a test that isolates and reproduces the bug.
   - Apply the root-cause fix and verify regression-free execution.

3. **Strict Verification Gates**
   - Before finishing any turn or declaring a task complete:
     1. Run `npm run test` (all unit tests must pass).
     2. Run `compile_applet` / `npm run build` (zero syntax or bundle errors).
     3. Ensure no console exceptions or broken UI flows.

4. **Zero Silent Failures**
   - Always catch, log, and render friendly user-facing errors.
   - Provide recovery actions or fallback states (e.g. deterministic mock fallbacks for network APIs).
