# TerminalBench Debugging Search Study

Public questionnaire/logging page for the human from-scratch study:

- https://hkasar1239.github.io/questionnaire/

Each participant receives all five selected TerminalBench tasks in one of ten balanced orders. The page records, for each task, whether the participant used web search, the first exact query, the command/error/context that triggered search, and whether the task was solved.

This study addresses the first part of the project framing: whether humans and agents hit search-triggering errors in predictable ways when solving the same debugging tasks.

## Response collection

The frontend is static and public. Do not put GitHub tokens or private secrets in it.

Recommended setup:

1. Open https://script.google.com/ and create or reuse the Apps Script project for this questionnaire.
2. Paste `questionnaire/collector/Code.gs` into `Code.gs`.
3. Run `setupStudySpreadsheet()` once and approve permissions.
4. Deploy as a Web App with `Execute as: me` and access set to `Anyone`.
5. Copy the `/exec` URL into `questionnaire/config.js` as `submitEndpoint`.
6. Commit and push the updated `questionnaire/config.js`.

The current page uses the endpoint in `config.js` if present. If no endpoint is configured, submitting downloads a CSV backup instead.

## Assignment

The page first asks the Apps Script collector for the least-used assignment bucket. If the endpoint is unavailable, it falls back to a deterministic local assignment.

Manual override is possible with:

- `https://hkasar1239.github.io/questionnaire/?bucket=1`
- ...
- `https://hkasar1239.github.io/questionnaire/?bucket=10`

## Analysis fields

Main fields:

- `participant_id`
- `assignment_order`
- `task_order`
- `task_id`
- `did_search`
- `minutes_to_first_search`
- `first_search_query`
- `first_search_trigger_command`
- `first_search_trigger_error_or_context`
- `later_search_queries`
- `solved`
- `used_llm`

The main analysis can use every attempted task. A robustness check should repeat the analysis with only task orders 1 and 2 per participant to control for fatigue.
