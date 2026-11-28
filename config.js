/*
 * CẤU HÌNH LMS LKT (đã điền sẵn cho Trường THPT Bình Thạnh Đông)
 * apiUrl  : link Web App Apps Script (đuôi /exec)
 * writeKey: khoá ghi, phải TRÙNG WRITE_KEY trong gas/Code.gs
 * aiKey   : (tuỳ chọn) khoá API Gemini dùng chung để nhận dạng PDF/ảnh – để "" thì mỗi GV tự nhập
 */
window.LMS_CONFIG = {
  appName: "LMS LKT",
  schoolName: "Trường THPT Bình Thạnh Đông",
  apiUrl: "https://script.google.com/macros/s/AKfycbzd6m7w0A3YYmJqG1HUHHkRlZW06qDJThBCavEsMtSLYWBNaIxRQiXEHU91L9OKorss/exec",
  writeKey: "2028Btd@TtLMS2029",
  aiKey: "",
  aiModel: "gemini-2.5-flash",
  author: "Lương Khánh Tường",
  contact: "ĐT/Zalo: 0916780807"
};
