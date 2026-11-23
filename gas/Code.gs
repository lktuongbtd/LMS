/**
 * LMS LKT – Máy chủ đồng bộ miễn phí bằng Google Apps Script + Google Sheets
 * Tác giả: Lương Khánh Tường – ĐT/Zalo: 0916780807
 *
 * CÁCH TRIỂN KHAI (xem thêm README.md):
 *  1. Tạo một Google Sheet mới → Tiện ích mở rộng → Apps Script.
 *  2. Xoá code mẫu, dán toàn bộ file này. Đổi WRITE_KEY bên dưới thành chuỗi bí mật của trường.
 *  3. Triển khai → Tùy chọn triển khai mới → Loại: Ứng dụng web
 *       - Thực thi dưới dạng: Tôi
 *       - Người có quyền truy cập: Bất kỳ ai
 *  4. Sao chép URL Web App (đuôi /exec) → dán vào config.js (apiUrl) trên GitHub.
 *  5. Giáo viên vào Cài đặt trong LMS, nhập Khoá ghi = WRITE_KEY, bấm "Đẩy lên máy chủ".
 */
const WRITE_KEY = 'doi-khoa-nay-ngay'; // ← ĐỔI THÀNH CHUỖI BÍ MẬT
const CHUNK = 45000;

function sh_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); if (header) s.appendRow(header); }
  return s;
}
function out_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- Kho dữ liệu chung (chia nhỏ vì mỗi ô tối đa 50.000 ký tự) ---------- */
function loadDb_() {
  const s = sh_('db');
  const n = s.getLastRow();
  if (!n) return null;
  return s.getRange(1, 1, n, 1).getValues().map(r => r[0]).join('');
}
function saveDb_(json) {
  const s = sh_('db');
  s.clear();
  const rows = [];
  for (let i = 0; i < json.length; i += CHUNK) rows.push([json.slice(i, i + CHUNK)]);
  if (rows.length) s.getRange(1, 1, rows.length, 1).setNumberFormat('@').setValues(rows);
}
function pwOverrides_() {
  const s = sh_('pw', ['uid', 'hash', 'at']);
  const v = s.getDataRange().getValues().slice(1);
  const m = {}; v.forEach(r => { if (r[0]) m[r[0]] = { hash: String(r[1]), at: Number(r[2]) || 0 }; });
  return m;
}
function dbWithPw_() {
  const raw = loadDb_(); if (!raw) return null;
  const db = JSON.parse(raw); const ov = pwOverrides_();
  (db.users || []).forEach(u => { const o = ov[u.id]; if (o && o.at > (u.pwAt || u.createdAt || 0)) { u.pw = o.hash; delete u.initPw; } });
  return db;
}
function rows_(name, header) { const s = sh_(name, header); return { s, v: s.getDataRange().getValues() }; }
function upsert_(name, header, keyCol, key, row) {
  const { s, v } = rows_(name, header);
  for (let i = 1; i < v.length; i++) if (String(v[i][keyCol]) === String(key)) { s.getRange(i + 1, 1, 1, row.length).setValues([row]); return; }
  s.appendRow(row);
}

/* ---------- GET ---------- */
function doGet(e) {
  const p = e.parameter || {};
  try {
    if (p.action === 'ping') return out_({ ok: true, app: 'LMS LKT', time: new Date().toISOString() });
    if (p.action === 'getDb') {
      const full = p.key && p.key === WRITE_KEY;
      const db = dbWithPw_();
      if (db && !full) (db.users || []).forEach(u => { delete u.pw; delete u.initPw; });
      const subs = rows_('subs', ['id', 'studentId', 'assignmentId', 'json', 'updatedAt']).v.slice(1)
        .filter(r => r[0] && (full || (p.sid && String(r[1]) === p.sid))).map(r => JSON.parse(r[3]));
      const progress = rows_('progress', ['key', 'studentId', 'json']).v.slice(1)
        .filter(r => r[0] && (full || (p.sid && String(r[1]) === p.sid))).map(r => JSON.parse(r[2]));
      return out_({ ok: true, db: db ? JSON.stringify(db) : null, subs, progress });
    }
    return out_({ ok: false, error: 'Hành động không hợp lệ' });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
}

/* ---------- POST ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents || '{}');
    if (b.action === 'saveDb') {
      if (b.key !== WRITE_KEY) return out_({ ok: false, error: 'Sai khoá ghi' });
      const incoming = JSON.parse(b.db); const old = dbWithPw_();
      if (old) { const m = {}; (old.users || []).forEach(u => m[u.id] = u);
        (incoming.users || []).forEach(u => { if (!u.pw && m[u.id]) { u.pw = m[u.id].pw; if (m[u.id].initPw) u.initPw = m[u.id].initPw; } }); }
      saveDb_(JSON.stringify(incoming));
      return out_({ ok: true, size: b.db.length });
    }
    if (b.action === 'login') {
      const db = dbWithPw_(); if (!db) return out_({ ok: false, error: 'Máy chủ chưa có dữ liệu' });
      const u = (db.users || []).find(x => String(x.username).toLowerCase() === String(b.username || '').trim().toLowerCase());
      if (!u) return out_({ ok: false, error: 'nouser' });
      if (u.pw !== b.pw) return out_({ ok: false, error: 'wrongpw' });
      if (u.locked) return out_({ ok: false, error: 'locked' });
      const user = Object.assign({}, u); delete user.initPw;
      return out_({ ok: true, user });
    }
    if (b.action === 'submit') {
      const it = JSON.parse(b.item);
      upsert_('subs', ['id', 'studentId', 'assignmentId', 'json', 'updatedAt'], 0, it.id, [it.id, it.studentId, it.assignmentId, JSON.stringify(it), new Date()]);
      return out_({ ok: true });
    }
    if (b.action === 'progress') {
      const it = JSON.parse(b.item); const key = it.studentId + '|' + it.lessonId;
      upsert_('progress', ['key', 'studentId', 'json'], 0, key, [key, it.studentId, JSON.stringify(it)]);
      return out_({ ok: true });
    }
    if (b.action === 'changePw') {
      const db = dbWithPw_(); const u = db && (db.users || []).find(x => x.id === b.uid);
      if (!u || u.pw !== b.old) return out_({ ok: false, error: 'Mật khẩu cũ không khớp với máy chủ' });
      upsert_('pw', ['uid', 'hash', 'at'], 0, b.uid, [b.uid, b.pw, Date.now()]);
      return out_({ ok: true });
    }
    return out_({ ok: false, error: 'Hành động không hợp lệ' });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}
