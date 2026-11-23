/*
 * CẤU HÌNH LMS LKT
 * ------------------------------------------------------------
 * Chạy độc lập (mỗi máy lưu dữ liệu riêng trong trình duyệt): để apiUrl = "".
 * Chạy nhiều máy dùng chung dữ liệu (học sinh làm bài ở nhà, GV xem điểm):
 *   1. Triển khai file gas/Code.gs thành Web App (xem README.md).
 *   2. Dán URL Web App vào apiUrl bên dưới rồi commit lên GitHub.
 *   3. Khoá ghi (writeKey) KHÔNG đặt ở đây – giáo viên nhập trong mục Cài đặt.
 */
window.LMS_CONFIG = {
  appName: "LMS LKT",
  schoolName: "Trường THPT Bình Thạnh Đông",
  apiUrl: "https://script.google.com/macros/s/AKfycbw4wM48XwoP2l6TPvnUr5kIxymJXjj-_2NFvJ3R1YNibWZMi8jQxfA6T7_RjFbdTIYU/exec",          // ví dụ: "https://script.google.com/macros/s/AKfy.../exec"
  author: "Lương Khánh Tường",
  contact: "ĐT/Zalo: 0916780807"
};
