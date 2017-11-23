function onOpen(e) {
  addMenu();
}

function addMenu() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createAddonMenu();
  menu.addItem("Open", "showSidebar")
  menu.addToUi();
}

function clearAll() {
  PropertiesService.getUserProperties().deleteAllProperties();
}

function getSourceUrl(path, params) {
  var url = "https://hull-google-sheets.eu.ngrok.io/";
  if (path) url += path;
  return url;
}

function showSidebar() {
  var sidebar = HtmlService.createTemplateFromFile("Sidebar");
  SpreadsheetApp.getUi().showSidebar(sidebar.evaluate());
}


function getActiveSheet() {
  return {
    index: getActiveSheetIndex(),
    importProgress: getActiveSheetImportProgress()
  }
}

function getActiveSheetIndex() {
  const sheet = SpreadsheetApp.getActiveSheet();
  return sheet.getIndex();
}

function getColumnNames() {
  const values = SpreadsheetApp
  .getActiveSheet()
  .getRange(1, 1, 1, 256)
  .getValues()[0];

  if (!values) return [];

  const columns = values.reverse().reduce(function(cols, col) {
    if (cols || col.length) {
      return (cols || []).concat([col]);
    }
    return cols;
  })
  if (!columns) return [];
  return columns.reverse();
}

function getHullFieldsList() {
  const settings = getUserProp("settings", {});
  if (!settings.hullToken) return [];
  const response = api("get", "schema/fields");

  if (response.statusCode !== 200) {
    return [];
  }

  return response.body;
}

function setUserProp(key, value) {
  PropertiesService
    .getUserProperties()
    .setProperty(key, JSON.stringify(value));
  return value;
}

function getUserProp(key, fallback) {
  const val = PropertiesService.getUserProperties().getProperty(key);
  if (val && (val.toString()[0] === "{" || val.toString()[0] === "[")) {
    try {
      return JSON.parse(val);
    } catch(err) {
      return fallback || val;
    }
  }
  return val || fallback;
}

function getActiveSheetMapping() {
  const activeSheetIndex = getActiveSheetIndex();
  return getUserProp("mapping-" + activeSheetIndex, []);
}

function getActiveSheetImportProgress() {
  const activeSheetIndex = getActiveSheetIndex();
  return getUserProp("importProgress-" + activeSheetIndex, {});
}

function setActiveSheetImportProgress(progress) {
  const activeSheetIndex = getActiveSheetIndex();
  return setUserProp("importProgress-" + activeSheetIndex, progress);
}

function bootstrap() {
  const props = {};
  props.activeSheetIndex = getActiveSheetIndex();
  props.mapping = getActiveSheetMapping();
  props.settings = getUserProp("settings", {});
  props.columns = getColumnNames();
  props.hullFields = getHullFieldsList();
  Logger.log(props);
  return props;
}

function api(method, path, data) {
  const settings = getUserProp("settings", {});

  if (!settings.hullToken) return { statusCode: 401 };

  const options = {
    muteHttpExceptions: true,
    contentType: "application/json",
    method: method
  };

  if (method !== "get" && data) {
    options.payload = JSON.stringify(data);
  }

  const res = UrlFetchApp.fetch(getSourceUrl(path + "?token=" + settings.hullToken), options);
  const ret = { statusCode: res.getResponseCode() };
  try {
    ret.body = JSON.parse(res.getContentText());
  } catch (err) {
    ret.error = err;
  }

  return ret;
}


function importData() {
  const settings = getUserProp("settings", {});
  const numRows = 100;
  var startRow = 2;
  var rows = [];
  var chunk = 1;
  var fetched;
  const stats = { imported: 0, skipped: 0, empty: 0 };

  const mapping = getActiveSheetMapping().map(function(m) {
    if (m) return m.hullField;
  });

  while (startRow && chunk < 10000) {
    var ret = importRange(startRow, numRows, mapping);
    if (!ret) break;
    chunk += 1;
    startRow += numRows;
    Object.keys(stats).forEach(function(k) {
      stats[k] += (ret.stats[k] || 0);
    });
    setActiveSheetImportProgress(stats);
  }

  setActiveSheetImportProgress({});

  return stats;
}

function importRange(startRow, numRows, mapping) {
  const stats = {};
  const fetched = fetchRows(startRow, numRows, mapping).reduce(function(memo, row) {
    if (Object.keys(row.traits).length === 0 || Object.keys(row.ident).length === 0) {
      memo.stats.skipped += 1;
    } else {
      memo.stats.imported += 1;
      memo.rows.push(row);
    }
    return memo;
  }, { rows: [], stats: { empty: 0, imported: 0 }});

  if (fetched.rows && fetched.rows.length > 0) {
    api("post", "import", fetched);
    return fetched;
  }
}

function getVal(val) {
  if (val != null && val.length > 0) return val;
}

function fetchRows(startRow, numRows, mapping) {
  // Make sure we skip the header row
  const start = startRow === 1 ? 2 : startRow;

  // Fetch data from range
  const data = SpreadsheetApp.getActiveSheet()
                             .getRange(start, 1, numRows, mapping.length)
                             .getValues();

  // Map values according to mapping
  return data.map(function(row) {
    return mapping.reduce(function(line, key, col) {
      const val = getVal(row[col]);
      const grp = ["email", "external_id"].indexOf(key) > -1 ? "ident" : "traits";
      if (key && val) line[grp][key] = val;
      return line;
    }, { ident: {}, traits: {}});
  });
}
