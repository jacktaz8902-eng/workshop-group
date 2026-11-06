// 마포구청 연사 체크리스트 — 팀 공유 저장용 Google Apps Script
// script.google.com → 새 프로젝트 → 이 코드 붙여넣기 → 배포 → 웹 앱
// (실행: 나 / 액세스: 모든 사용자) → 웹 앱 URL을 index.html의 SCRIPT_URL에 넣기

function load_() {
  var raw = PropertiesService.getScriptProperties().getProperty('state');
  return raw ? JSON.parse(raw) : { updatedAt: null, speakers: {} };
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return out_(load_());
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var st = load_();
    var body = JSON.parse(e.postData.contents || '{}');
    (body.changes || []).slice(0, 100).forEach(function (c) {
      if (!/^[a-z-]{2,30}$/.test(c.s) || !/^[a-z]{2,20}$/.test(c.k)) return;
      st.speakers[c.s] = st.speakers[c.s] || {};
      st.speakers[c.s][c.k] = { done: !!c.done, note: String(c.note || '').slice(0, 300) };
    });
    st.updatedAt = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty('state', JSON.stringify(st));
    return out_(st);
  } finally {
    lock.releaseLock();
  }
}
