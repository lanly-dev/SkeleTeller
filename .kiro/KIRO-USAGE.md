# How Kiro Was Used in SkeleTeller

This document explains how Kiro features were used throughout the SkeleTeller project, for the Kiroween 2026 submission.

## Overview

SkeleTeller was built entirely using **Kiro IDE** in a **spec-first development** approach. Every feature was specified before implementation, with specs, steering, hooks, and workflows committed to `.kiro/` as the project evolved.

---

## 1. Spec-Driven Development

### What We Did

Created **3 comprehensive specs** in `.kiro/specs/` before writing any implementation code:

1. **skeleteller-core.md** (~2,200 lines)
   - Requirements: storyboard concept, 5 scene types, two output formats
   - Design: stack decisions with justifications
   - Task breakdown: skeleton → demo-video → slide-walkthrough
   - Acceptance criteria and scope caps

2. **demo-video-app.md** (~900 lines)
   - Architecture: Python + FFmpeg pipeline
   - Scene renderer designs for 5 types
   - Implementation tasks and timeline

3. **slide-walkthrough-app.md** (~800 lines)
   - Architecture: Static web app with Alpine.js
   - Template designs and interactivity patterns
   - Build process and deployment strategy

### How Specs Were Structured

Each spec follows this pattern:
- **Overview** — What this component does
- **Requirements** — Functional and non-functional requirements
- **Design** — Architecture decisions with justifications
- **Implementation Tasks** — Checklist of work items
- **Acceptance Criteria** — How to verify completion
- **Open Questions** — Decisions pending input
- **Scope Boundaries** — What's explicitly out of scope

### Spec-First vs. Vibe Coding

**Vibe coding approach:**
- Start coding immediately
- Figure out design as you go
- Refactor when you hit problems
- Documentation happens later (or never)

**Our spec-first approach:**
- Think through architecture first
- Document decisions and rationale
- Clear acceptance criteria before starting
- Implementation becomes straightforward
- Git history shows disciplined process

**Benefits we observed:**
- Fewer dead ends and rewrites
- Clear scope boundaries prevented feature creep
- Easy to review progress against spec
- Specs themselves are artifacts judges can evaluate

**Tradeoffs:**
- More upfront time investment
- Requires discipline to not jump into coding
- Specs can become outdated if not maintained

**Verdict:** For a competition entry where git history is evidence, spec-first was clearly superior. The specs demonstrate thoughtful design and give judges insight into our process.

---

## 2. Steering Documents

Created **2 steering files** in `.kiro/steering/` to guide Kiro's work:

### storyboard-drafting.md (manual inclusion)

**Purpose:** Comprehensive guide for writing SkeleTeller storyboards

**Content:**
- Process: Understand project → Choose story arc → Draft scenes → Gather assets → Validate
- Scene type guidelines with examples
- Best practices (keep focused, show don't tell, timing matters)
- Common mistakes to avoid
- Example minimal storyboard

**How it helped:**
- Kiro could draft storyboards following the guide
- Consistent quality across different projects
- Reduced back-and-forth on storyboard structure

### project-workflow.md (auto inclusion)

**Purpose:** Development workflow and conventions for SkeleTeller

**Content:**
- Project context and status
- Fixed repository structure
- Development phases and task lists
- Hard rules (no absolute paths, spec-first, etc.)
- Stack decisions locked from core spec
- Common tasks and commands

**How it helped:**
- Kiro loaded context automatically each session
- Enforced consistency (no absolute paths, .kiro/ never ignored)
- Quick reference for common operations
- Phase tracking kept work organized

**Design Decision:** Auto-inclusion for workflow (always relevant) vs. manual for drafting guide (only needed when creating storyboards).

---

## 3. Agent Hooks

Created **4 hooks** in `.kiro/hooks/` to automate workflows:

### 1. validate-storyboard.json (PostFileSave)

**Trigger:** Fires when YAML files are saved

**Action:** Runs Python validator on the storyboard
```bash
python skeleton/schema/validator.py "$KIRO_FILE_PATH"
```

**Purpose:** Instant feedback on storyboard validity

**Impact:** Caught schema errors immediately, saved debugging time later

---

### 2. session-start-context.json (SessionStart)

**Trigger:** Fires when a new Kiro session starts

**Action:** Displays project context via agent prompt

**Content:**
- Project overview and phase status
- Key file locations
- Important rules (spec-first, no absolute paths)
- Common commands

**Purpose:** Orient Kiro at session start without manual prompting

**Impact:** Faster session startup, consistent awareness of conventions

---

### 3. confirm-deletions.json (PreToolUse)

**Trigger:** Fires before delete_file operations

**Action:** Asks for user confirmation via permission decision

**Purpose:** Safety gate for destructive operations

**Impact:** Prevented accidental deletions, added user control

---

### 4. test-on-schema-change.json (PostFileSave)

**Trigger:** Fires when schema files (`.py` or `.json` in `skeleton/schema/`) are saved

**Action:** Runs validator on sample storyboard as smoke test

**Purpose:** Immediate feedback if schema changes break validation

**Impact:** Caught regressions early, validated changes automatically

---

### Hook Design Philosophy

**When to use hooks:**
- Repetitive validations → automate with PostFileSave
- Context reminders → SessionStart agent prompt
- Safety checks → PreToolUse with permission decision
- Smoke tests → PostFileSave on critical files

**When NOT to use hooks:**
- Complex multi-step processes → use workflows instead
- Rarely-needed operations → manual is fine
- Expensive operations → user should trigger explicitly

---

## 4. Kiro Crew Workflows

Created **1 workflow** in `.kiro/workflows/` for agent orchestration:

### generate-storyboard.workflow.json

**Purpose:** Automatically generate a draft storyboard from a project's README and assets

**Steps:**
1. **Analyze Project** (wf-planner)
   - Reads README and examines assets
   - Identifies key features and visuals
   - Produces structured analysis

2. **Draft Storyboard** (wf-coder)
   - Creates YAML following SkeleTeller schema
   - References assets with relative paths
   - Follows guidelines from steering docs

3. **Validate** (wf-coder)
   - Runs schema validator
   - Fixes errors if validation fails
   - Ensures compliance before proceeding

4. **Summarize** (wf-coder)
   - Scene breakdown and asset inventory
   - Notes missing assets
   - Provides overview for review

**Inputs:**
- `project_path` — Directory with README and screenshots
- `output_path` — Where to save storyboard (default: storyboard.yml)

**Usage Example:**
```bash
kiro workflow run .kiro/workflows/generate-storyboard.workflow.json \
  --input project_path=../Skinwalker \
  --input output_path=skinwalker-storyboard.yml
```

**Why a workflow?**
- **Multi-step process:** Analysis → drafting → validation → summary
- **Agent orchestration:** Different agents for investigation vs. implementation
- **Repeatability:** Generate storyboards for multiple projects consistently
- **Quality gates:** Built-in validation step

**Workflow vs. Manual:**
- Manual: Read README, write YAML by hand, run validator
- Workflow: One command, automated analysis and validation
- Both valid; workflow shines when processing multiple projects

---

## 5. Kiro IDE Features Used

### Interactive Development
- **Chat-driven editing:** Conversational spec refinement and implementation
- **File operations:** Created, edited, validated files through Kiro
- **Command execution:** Ran validator, generated assets, tested output

### Context Management
- **#File references:** Brought files into context efficiently
- **Steering auto-inclusion:** Workflow guide loaded automatically
- **Session persistence:** Work continued across multiple sessions

### Tool Integration
- **Python execution:** Validator and asset generator
- **Git operations:** Commits tracked spec-first discipline
- **File tree navigation:** Explored project structure

---

## 6. What We Didn't Use (And Why)

### Kiro CLI ❌
**Why not:** IDE provided better interactive experience for spec-first development

**When CLI would help:** CI/CD pipelines, scripted builds (not needed for this entry)

---

### Kiro Web ❌
**Why not:** Not applicable to this project type

**When Web would help:** Collaborative editing, browser-based demos

---

### MCP (Model Context Protocol) ❌
**Why not:** No external systems to integrate

**When MCP would help:** Connecting to APIs, databases, external tools

---

### Property-Based Testing ❌
**Why not:** Limited time, focused on schema validation instead

**When PBT would help:** Testing storyboard generation with random inputs

---

### Kiro Powers ❌
**Why not:** No powers needed for this project

**When Powers would help:** Specialized domains requiring packaged workflows

---

## 7. Development Process

### Phase 0: Specs Before Code
1. Created core spec with requirements and design
2. Made stack decisions with justifications
3. Broke work into phases
4. Committed specs before any implementation

**Evidence:** Git history shows `.kiro/specs/` commits before `skeleton/` code

---

### Phase 1: Skeleton Implementation
1. Implemented storyboard schema and validator
2. Created scene type documentation
3. Generated sample storyboard with assets
4. Added steering docs and hooks
5. Tested validator on sample

**Kiro's role:** Wrote all code following spec, validated against schema

---

### Phase 2 & 3: App Specs
1. Created detailed specs for both apps
2. Documented architecture and design decisions
3. Listed implementation tasks
4. Defined acceptance criteria

**Specs committed before implementation** (spec-first discipline maintained)

---

## 8. Git History as Evidence

### Commit Pattern
```
feat: add core spec (requirements, design, tasks)
docs: create storyboard drafting guide
chore: add MIT license and .gitignore
feat: implement storyboard schema and validator
feat: add sample storyboard with assets
feat: create validation hook
feat: add demo video app spec
feat: add slide walkthrough app spec
feat: create generate-storyboard workflow
feat: add session start and deletion confirmation hooks
```

**Pattern:** Specs → Implementation → Documentation → Automation

**Evidence for judges:**
- Specs committed first
- Implementation follows spec structure
- `.kiro/` tracked throughout (never ignored)
- Hooks and workflows added progressively

---

## 9. How This Differs from Other Approaches

### Traditional Development
- Write code first, document later
- Ad-hoc validation
- Manual repetitive tasks
- Implicit knowledge in developer's head

### Vibe Coding with AI
- Conversational exploration
- Refactor as you go
- Minimal planning
- Code is the artifact

### Our Spec-First with Kiro
- Explicit design decisions upfront
- Specs map directly to features
- Automated validation and testing
- Specs, code, AND automation are artifacts

**Key insight:** For a judged competition, the process itself is part of the product. Spec-first development makes the process visible and auditable.

---

## 10. What We'd Do Differently

### More Workflows
**What we have:** 1 workflow (storyboard generation)

**What we could add:**
- Workflow to render both outputs from a storyboard
- Workflow to optimize/validate existing storyboards
- Workflow for full dogfooding pipeline

**Tradeoff:** More workflows = better automation evidence, but adds complexity

---

### Custom Agents
**What we have:** Used built-in agents (wf-planner, wf-coder)

**What we could add:**
- Custom "storyboard-generator" agent with specialized prompts
- Custom "demo-reviewer" agent for quality checks

**Tradeoff:** Custom agents = advanced usage, but requires more setup

---

### Property-Based Testing
**What we have:** Schema validation only

**What we could add:**
- Generate random valid storyboards and verify they render
- Fuzz testing for edge cases

**Tradeoff:** PBT = comprehensive testing, but time-intensive

---

## 11. Lessons Learned

### What Worked Well

1. **Spec-first discipline**
   - Clear direction for each phase
   - Easy to review progress
   - Git history tells the story

2. **Steering docs**
   - Consistent guidance across sessions
   - Auto-inclusion saved time
   - Manual inclusion when needed

3. **Validation hooks**
   - Instant feedback on errors
   - Saved debugging time
   - Quality gates automated

### What Was Challenging

1. **Upfront spec time**
   - Felt slow at first
   - Required discipline not to jump into coding
   - Paid off during implementation

2. **Maintaining specs**
   - Specs can drift from implementation
   - Requires updates as decisions change
   - Version control helps track evolution

3. **Workflow complexity**
   - Multi-step workflows need careful design
   - Error handling in workflows is important
   - Testing workflows takes time

---

## 12. Impact on Development

### Speed
- **Slower start:** Specs took time upfront
- **Faster implementation:** Clear path to follow
- **Fewer rewrites:** Good design prevented dead ends
- **Net:** About the same total time, but higher quality

### Quality
- **Better architecture:** Thought through design first
- **Fewer bugs:** Validation caught errors early
- **More maintainable:** Specs document decisions
- **Better for judging:** Process is visible

### Collaboration (with Kiro)
- **Clearer communication:** Specs provided shared understanding
- **Easier handoffs:** Sessions could pause and resume
- **Better prompts:** Context from steering and specs
- **More productive:** Kiro knew the conventions

---

## 13. Recommendations for Others

### When to Use Spec-First
- ✅ Competition entries (process is part of the product)
- ✅ Complex projects with multiple components
- ✅ Team projects (specs = shared understanding)
- ✅ When architecture matters more than speed

### When Vibe Coding Works Better
- ✅ Exploratory prototypes
- ✅ Simple single-file scripts
- ✅ Learning new technologies
- ✅ Throwaway experiments

### Kiro Features to Use
- ✅ **Always:** Specs for anything non-trivial
- ✅ **Often:** Steering docs for conventions and context
- ✅ **Selectively:** Hooks for repetitive tasks
- ✅ **As needed:** Workflows for multi-step automation

---

## 14. Evidence for Judges

### Breadth of Kiro Usage
- ✅ **Kiro IDE:** All development
- ✅ **Specs:** 3 comprehensive specs
- ✅ **Steering:** 2 docs (auto and manual inclusion)
- ✅ **Hooks:** 4 hooks (3 event types, 2 action types)
- ✅ **Workflows:** 1 multi-step workflow with agent orchestration

### Depth of Kiro Usage
- **Spec-driven development:** Core methodology, not just documentation
- **Git history:** Shows spec-first discipline
- **Steering integration:** Auto and manual inclusion patterns
- **Hook variety:** Different triggers and action types
- **Workflow complexity:** Multi-step with validation gates

### Innovation
- **Specs as specs:** Storyboard schema is itself a spec for content
- **Meta-application:** Tool for creating demos about tools
- **Automated quality gates:** Validation at multiple points
- **Dogfooding opportunity:** Entry's demo video produced by its own app

---

## Summary

SkeleTeller demonstrates **thorough and varied use of Kiro** through:
- Disciplined spec-first development
- Automated workflows with hooks and Kiro Crew
- Context management via steering documents
- Validation gates and quality automation
- Clear git history showing the process

The result: A well-architected project where the development process itself is an artifact worth evaluating.
