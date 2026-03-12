# Commit Conventions

This document defines the **Git commit naming convention** used in this project.

All contributors — including **AI agents (Codex, Claude, Copilot)** — must follow this convention when generating commits.

This convention follows the same style used in the **Listing Copilot** project.

---

# Commit Message Format

All commits must follow this structure:

```
type(scope): short description
```

Example:

```
feat(auth): add login form validation
```

---

# Core Rules

## 1. Use the standard structure

```
type(scope): description
```

- **type** → category of change
- **scope** → part of the application affected
- **description** → short summary of the change

---

## 2. Use lowercase

Commit descriptions must start with lowercase.

Good:

```
fix(api): handle empty response state
```

Bad:

```
fix(api): Handle Empty Response State
```

---

## 3. Use imperative mood

Write commits like **instructions or actions**.

Good:

```
feat(search): add debounce to meal search
```

Bad:

```
feat(search): added debounce to meal search
```

Bad:

```
feat(search): adds debounce to meal search
```

---

## 4. Keep commits short

Ideal commit title length:

```
< 72 characters
```

Example:

```
refactor(cards): extract meal card into reusable component
```

---

## 5. One logical change per commit

Each commit should represent **one clear unit of work**.

Good practice:

- one commit for auth setup
- one commit for favorites feature
- one commit for API error handling

Bad example:

```
feat(app): auth + navbar + footer + search improvements
```

---

## 6. No period at the end

Good:

```
docs(readme): add project setup instructions
```

Bad:

```
docs(readme): add project setup instructions.
```

---

# Allowed Commit Types

## feat

Used for **new features**.

Example:

```
feat(favorites): add save recipe functionality
```

---

## fix

Used for **bug fixes**.

Example:

```
fix(search): prevent duplicate requests on input change
```

---

## refactor

Used for **code improvements without behavior change**.

Example:

```
refactor(api): move fetch helpers into service layer
```

---

## chore

Used for **maintenance, tooling, configuration, setup**.

Example:

```
chore(vite): configure path aliases
```

---

## docs

Used for **documentation changes only**.

Example:

```
docs(readme): add project overview
```

---

## style

Used for **formatting or styling changes without logic change**.

Example:

```
style(layout): adjust spacing in header
```

---

## test

Used for **tests**.

Example:

```
test(search): add unit tests for query normalization
```

---

## perf

Used for **performance improvements**.

Example:

```
perf(images): lazy load recipe thumbnails
```

---

# Recommended Scopes

Scopes should reflect **real parts of the application**, not file names.

Common scopes:

```
auth
api
ui
layout
routing
search
filters
favorites
details
forms
state
hooks
components
pages
supabase
env
tailwind
build
config
readme
app-shell
email
```

Example:

```
feat(search): add debounced search input
```

---

# Good Commit Examples

## Setup / configuration

```
chore(config): initialize project folder structure
chore(tailwind): configure tailwindcss v4 global styles
fix(build): register tailwind vite plugin correctly
```

---

## Features

```
feat(search): add keyword search for meals
feat(filters): implement category filter
feat(favorites): persist saved meals in local storage
feat(details): render ingredients and instructions
feat(routing): add recipe details page route
```

---

## Refactors

```
refactor(components): split header into reusable components
refactor(state): simplify favorites state management
refactor(api): extract api requests into service layer
```

---

## Fixes

```
fix(ui): align filter controls on mobile
fix(details): handle missing youtube link
fix(search): clear stale results when input is empty
fix(favorites): prevent duplicate saved items
```

---

## Documentation

```
docs(readme): add project overview
docs(setup): document environment variables
```

---

# Naming Quality Standard

A good commit message should clearly answer:

- **What changed**
- **Where it changed**
- **Why the change exists**

Good:

```
feat(favorites): sync saved meals with local storage
```

Weak:

```
update code
```

Weak:

```
fix stuff
```

Weak:

```
small improvements
```

---

# What To Avoid

Avoid vague commit messages like:

```
update
fix bug
cleanup
final version
new update
misc fixes
working version
changes
```

These make Git history **hard to understand and unprofessional**.

---

# Breaking Changes

Breaking changes must include `!`.

Example:

```
refactor(api)!: change recipe response structure
```

A commit body may explain the breaking change if needed.

---

# Commit Body (Optional)

For larger commits you can include additional details.

Example:

```
feat(auth): implement email login flow

- add login form
- connect auth provider
- persist session
```

---

# Development Workflow

## During development

Commit when a **logical unit of work is finished**.

Examples:

- after navbar setup
- after search feature works
- after favorites persistence works
- after API error handling is implemented

---

## Before pushing

Verify each commit:

- has a valid **type**
- includes a meaningful **scope**
- uses **lowercase**
- uses **imperative wording**
- contains **one logical change**

---

# Final Standard

Default commit style:

```
type(scope): short description
```

Example:

```
feat(search): add debounced recipe search input
```

This is the **official Git commit convention for this project**.
