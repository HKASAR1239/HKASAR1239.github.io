const STUDY_TITLE = 'Human debugging search query baseline';
const PROPERTY_KEY = 'HUMAN_QUERY_RESPONSE_SPREADSHEET_ID';
const SHEET_NAME = 'responses';
const ASSIGNMENTS_SHEET_NAME = 'assignments';
const HEADERS = [
  'server_received_at', 'submitted_at_client', 'source_url', 'participant_id',
  'background', 'experience', 'shard', 'task_id', 'instance_id', 'repo', 'query'
];
const ASSIGNMENT_HEADERS = [
  'assigned_at', 'bucket', 'bucket_count_before', 'bucket_count_after', 'source_url'
];

function setupStudySpreadsheet() {
  const spreadsheet = getOrCreateSpreadsheet_();
  ensureAssignmentSheet_(spreadsheet);
  Logger.log(spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'assign') {
    return assignBucket_(e);
  }
  return json_({ ok: true, service: STUDY_TITLE });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet);
    const receivedAt = new Date();
    const responses = Array.isArray(payload.responses) ? payload.responses : [];
    if (!responses.length) throw new Error('No responses in payload.');
    const rows = responses.map(response => [
      receivedAt,
      payload.submitted_at_client || '',
      payload.source_url || '',
      payload.participant_id || '',
      payload.background || '',
      payload.experience || '',
      payload.shard || '',
      response.task_id || '',
      response.instance_id || '',
      response.repo || '',
      response.query || ''
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return json_({ ok: true, rows: rows.length });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) return JSON.parse(e.parameter.payload);
  if (e && e.postData && e.postData.contents) return JSON.parse(e.postData.contents);
  throw new Error('Missing POST body.');
}

function getOrCreateSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(PROPERTY_KEY);
  if (existingId) return SpreadsheetApp.openById(existingId);
  const spreadsheet = SpreadsheetApp.create(STUDY_TITLE + ' responses');
  properties.setProperty(PROPERTY_KEY, spreadsheet.getId());
  ensureSheet_(spreadsheet);
  ensureAssignmentSheet_(spreadsheet);
  return spreadsheet;
}

function ensureSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureAssignmentSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(ASSIGNMENTS_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(ASSIGNMENTS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ASSIGNMENT_HEADERS.length).setValues([ASSIGNMENT_HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function assignBucket_(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  lock.waitLock(5000);
  locked = true;
  try {
    const bucketCount = parseBucketCount_(e.parameter.buckets);
    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = ensureAssignmentSheet_(spreadsheet);
    const counts = Array(bucketCount).fill(0);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const rows = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      rows.forEach(row => {
        const bucket = Number(row[0]);
        if (Number.isInteger(bucket) && bucket >= 1 && bucket <= bucketCount) counts[bucket - 1] += 1;
      });
    }
    const minCount = Math.min.apply(null, counts);
    const candidates = counts.map((count, index) => count === minCount ? index + 1 : null).filter(Boolean);
    const bucket = candidates[Math.floor(Math.random() * candidates.length)];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, ASSIGNMENT_HEADERS.length).setValues([[
      new Date(),
      bucket,
      counts[bucket - 1],
      counts[bucket - 1] + 1,
      e.parameter.source_url || ''
    ]]);
    return scriptOrJson_({ ok: true, bucket: bucket, bucket_count_before: counts[bucket - 1] }, e);
  } catch (error) {
    return scriptOrJson_({ ok: false, error: String(error && error.message ? error.message : error) }, e);
  } finally {
    if (locked) lock.releaseLock();
  }
}

function parseBucketCount_(value) {
  const parsed = Number(value || 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) return 10;
  return parsed;
}

function scriptOrJson_(value, e) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(value) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(value);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
