# Debugging Search Query Study

Public questionnaire for the human baseline study. Each shard contains 10 tasks:

- https://hkasar1239.github.io/questionnaire/?shard=1
- https://hkasar1239.github.io/questionnaire/?shard=2
- https://hkasar1239.github.io/questionnaire/?shard=3
- https://hkasar1239.github.io/questionnaire/?shard=4
- https://hkasar1239.github.io/questionnaire/?shard=5

Short aliases are also available:

- https://hkasar1239.github.io/questionnaire/set-1/
- https://hkasar1239.github.io/questionnaire/set-2/
- https://hkasar1239.github.io/questionnaire/set-3/
- https://hkasar1239.github.io/questionnaire/set-4/
- https://hkasar1239.github.io/questionnaire/set-5/

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
