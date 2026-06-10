const STUDY_TITLE = 'Human debugging search query baseline';
const PROPERTY_KEY = 'HUMAN_QUERY_RESPONSE_SPREADSHEET_ID';
const SHEET_NAME = 'responses';
const HEADERS = [
  'server_received_at', 'submitted_at_client', 'source_url', 'participant_id',
  'background', 'experience', 'shard', 'task_id', 'instance_id', 'repo', 'query'
];

function setupStudySpreadsheet() {
  const spreadsheet = getOrCreateSpreadsheet_();
  return spreadsheet.getUrl();
}

function doGet() {
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
  if (!e || !e.postData || !e.postData.contents) {
    if (e && e.parameter && e.parameter.payload) return JSON.parse(e.parameter.payload);
    throw new Error('Missing POST body.');
  }
  return JSON.parse(e.postData.contents);
}

function getOrCreateSpreadsheet_() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(PROPERTY_KEY);
  if (existingId) return SpreadsheetApp.openById(existingId);
  const spreadsheet = SpreadsheetApp.create(STUDY_TITLE + ' responses');
  properties.setProperty(PROPERTY_KEY, spreadsheet.getId());
  ensureSheet_(spreadsheet);
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

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
