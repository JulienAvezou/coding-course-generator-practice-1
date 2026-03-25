# coding-course-generator-practice-1

Starter project for the Coding Course Generator beginner demo course.

## What you will build

A personal library tracker that grows from JavaScript basics into a full-stack web app with a local API and SQLite.

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Structure

```text
course/
  milestone-validation.json
public/
  index.html
  styles.css
  app.js
scripts/
  validate-milestone.js
server/
  index.js
src/
  library.js
db/
  schema.sql
tests/
  smoke.test.js
```

## Commands

- `npm run dev`
- `npm run lint`
- `npm run format`
- `npm run test`
- `npm run validate:milestone -- --branch milestone-01-starter-change`
- `npm run golden-path`

## Testing basics

Run the starter tests with:

```bash
npm run test
```

A test checks one small behavior.

- A passing test means the actual result matched the expected result.
- A failing test means the code or the expectation needs attention.

Start by reading `tests/smoke.test.js`. It is intentionally small so you can learn how tests read before you write your own.

## Milestone validation

The GitHub workflow also runs `Milestone Validation` on pull requests.
That check uses your branch name to decide which milestone contract to verify.

- Name milestone branches like `milestone-01-your-change`
- Keep the validation files in place so the course can verify the right milestone
