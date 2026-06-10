# Debugging Search Query Study

Public questionnaire for the human baseline study. The main study now uses one 5-task core set so multiple participants answer the same errors:

- https://hkasar1239.github.io/questionnaire/
- https://hkasar1239.github.io/questionnaire/core/

The old `set-1` through `set-5` aliases now redirect to the core 5-task study, so previously shared links still work. The full 50-task version remains available manually via `?shard=1` through `?shard=5` for backup only.

## Response collection

Do not put a GitHub token in the frontend. GitHub Pages serves the JavaScript publicly, even when the repository itself is private.

Recommended setup:

1. Open https://script.google.com/ and create a new Apps Script project.
2. Paste `questionnaire/collector/Code.gs` into `Code.gs`.
3. Run `setupStudySpreadsheet()` once and approve permissions.
4. Deploy as a Web App with `Execute as: me` and access set to the intended respondents.
5. Copy the `/exec` URL into `questionnaire/config.js` as `submitEndpoint`.
6. Commit and push `questionnaire/config.js`.

If `submitEndpoint` is empty, the questionnaire downloads a JSON backup on submit.
