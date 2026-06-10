# Debugging Search Query Study

Public questionnaire for the human baseline study. The main public link assigns each participant to one balanced 5-task bucket and keeps that assignment stable in the browser:

- https://hkasar1239.github.io/questionnaire/

There are 10 balanced buckets. Each bucket contains 5 tasks, and together the buckets cover the 50-task pool once. The frontend first asks the Apps Script collector for the least-used bucket; if that endpoint has not been redeployed yet, it falls back to a local random bucket.

Manual links are available for coordination or backup:

- https://hkasar1239.github.io/questionnaire/?bucket=1
- ...
- https://hkasar1239.github.io/questionnaire/?bucket=10

The focused 5-task core version remains available for smaller pilots:

- https://hkasar1239.github.io/questionnaire/core/

The old `/questionnaire/set-1/` through `/questionnaire/set-5/` aliases redirect to the balanced assignment flow. The old 10-task shard view remains available as `?shard=1` through `?shard=5`, but only as a technical backup.

## Response collection

Do not put a GitHub token in the frontend. GitHub Pages serves the JavaScript publicly, even when the repository itself is private.

Recommended setup:

1. Open https://script.google.com/ and create a new Apps Script project.
2. Paste `questionnaire/collector/Code.gs` into `Code.gs`.
3. Run `setupStudySpreadsheet()` once and approve permissions.
4. Deploy as a Web App with `Execute as: me` and access set to the intended respondents.
5. Copy the `/exec` URL into `questionnaire/config.js` as `submitEndpoint`.
6. Commit and push `questionnaire/config.js`.

Redeploy the Apps Script after changing `Code.gs`; otherwise the questionnaire still works, but bucket assignment uses the local fallback instead of the global counter.

If `submitEndpoint` is empty, the questionnaire downloads a JSON backup on submit.
