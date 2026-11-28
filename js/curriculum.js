/* LMS LKT – curriculum.js: CÂY CHƯƠNG TRÌNH GDPT 2018 (bộ sách Kết nối tri thức với cuộc sống)
 * Môn → Lớp → Chương → Bài. Giáo viên tự thêm chương/bài trong Ngân hàng → 🌳 Cây chương trình.
 * Viết gọn: mỗi chương là chuỗi "Tên chương|Bài 1|Bài 2|...". */
'use strict';
const CURRIC_RAW = {
toan:{
10:['Chương I. Mệnh đề và tập hợp|Bài 1. Mệnh đề|Bài 2. Tập hợp và các phép toán trên tập hợp',
'Chương II. Bất phương trình và hệ bất phương trình bậc nhất hai ẩn|Bài 3. Bất phương trình bậc nhất hai ẩn|Bài 4. Hệ bất phương trình bậc nhất hai ẩn',
'Chương III. Hệ thức lượng trong tam giác|Bài 5. Giá trị lượng giác của một góc từ 0° đến 180°|Bài 6. Hệ thức lượng trong tam giác',
'Chương IV. Vectơ|Bài 7. Các khái niệm mở đầu|Bài 8. Tổng và hiệu của hai vectơ|Bài 9. Tích của một vectơ với một số|Bài 10. Vectơ trong mặt phẳng toạ độ|Bài 11. Tích vô hướng của hai vectơ',
'Chương V. Các số đặc trưng của mẫu số liệu không ghép nhóm|Bài 12. Số gần đúng và sai số|Bài 13. Các số đặc trưng đo xu thế trung tâm|Bài 14. Các số đặc trưng đo độ phân tán',
'Chương VI. Hàm số, đồ thị và ứng dụng|Bài 15. Hàm số|Bài 16. Hàm số bậc hai|Bài 17. Dấu của tam thức bậc hai|Bài 18. Phương trình quy về phương trình bậc hai',
'Chương VII. Phương pháp toạ độ trong mặt phẳng|Bài 19. Phương trình đường thẳng|Bài 20. Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách|Bài 21. Đường tròn trong mặt phẳng toạ độ|Bài 22. Ba đường conic',
'Chương VIII. Đại số tổ hợp|Bài 23. Quy tắc đếm|Bài 24. Hoán vị, chỉnh hợp và tổ hợp|Bài 25. Nhị thức Newton',
'Chương IX. Tính xác suất theo định nghĩa cổ điển|Bài 26. Biến cố và định nghĩa cổ điển của xác suất|Bài 27. Thực hành tính xác suất theo định nghĩa cổ điển'],
11:['Chương I. Hàm số lượng giác và phương trình lượng giác|Bài 1. Giá trị lượng giác của góc lượng giác|Bài 2. Công thức lượng giác|Bài 3. Hàm số lượng giác|Bài 4. Phương trình lượng giác cơ bản',
'Chương II. Dãy số. Cấp số cộng và cấp số nhân|Bài 5. Dãy số|Bài 6. Cấp số cộng|Bài 7. Cấp số nhân',
'Chương III. Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm|Bài 8. Mẫu số liệu ghép nhóm|Bài 9. Các số đặc trưng đo xu thế trung tâm',
'Chương IV. Quan hệ song song trong không gian|Bài 10. Đường thẳng và mặt phẳng trong không gian|Bài 11. Hai đường thẳng song song|Bài 12. Đường thẳng và mặt phẳng song song|Bài 13. Hai mặt phẳng song song|Bài 14. Phép chiếu song song',
'Chương V. Giới hạn. Hàm số liên tục|Bài 15. Giới hạn của dãy số|Bài 16. Giới hạn của hàm số|Bài 17. Hàm số liên tục',
'Chương VI. Hàm số mũ và hàm số lôgarit|Bài 18. Luỹ thừa với số mũ thực|Bài 19. Lôgarit|Bài 20. Hàm số mũ và hàm số lôgarit|Bài 21. Phương trình, bất phương trình mũ và lôgarit',
'Chương VII. Quan hệ vuông góc trong không gian|Bài 22. Hai đường thẳng vuông góc|Bài 23. Đường thẳng vuông góc với mặt phẳng|Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng|Bài 25. Hai mặt phẳng vuông góc|Bài 26. Khoảng cách|Bài 27. Thể tích',
'Chương VIII. Các quy tắc tính xác suất|Bài 28. Biến cố hợp, biến cố giao, biến cố độc lập|Bài 29. Công thức cộng xác suất|Bài 30. Công thức nhân xác suất cho hai biến cố độc lập',
'Chương IX. Đạo hàm|Bài 31. Định nghĩa và ý nghĩa của đạo hàm|Bài 32. Các quy tắc tính đạo hàm|Bài 33. Đạo hàm cấp hai'],
12:['Chương I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số|Bài 1. Tính đơn điệu và cực trị của hàm số|Bài 2. Giá trị lớn nhất và giá trị nhỏ nhất của hàm số|Bài 3. Đường tiệm cận của đồ thị hàm số|Bài 4. Khảo sát sự biến thiên và vẽ đồ thị của hàm số|Bài 5. Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn',
'Chương II. Vectơ và hệ trục toạ độ trong không gian|Bài 6. Vectơ trong không gian|Bài 7. Hệ trục toạ độ trong không gian|Bài 8. Biểu thức toạ độ của các phép toán vectơ',
'Chương III. Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm|Bài 9. Khoảng biến thiên và khoảng tứ phân vị|Bài 10. Phương sai và độ lệch chuẩn',
'Chương IV. Nguyên hàm và tích phân|Bài 11. Nguyên hàm|Bài 12. Tích phân|Bài 13. Ứng dụng hình học của tích phân',
'Chương V. Phương pháp toạ độ trong không gian|Bài 14. Phương trình mặt phẳng|Bài 15. Phương trình đường thẳng trong không gian|Bài 16. Công thức tính góc trong không gian|Bài 17. Phương trình mặt cầu',
'Chương VI. Xác suất có điều kiện|Bài 18. Xác suất có điều kiện|Bài 19. Công thức xác suất toàn phần và công thức Bayes']},
li:{
10:['Chương I. Mở đầu|Bài 1. Làm quen với Vật lí|Bài 2. Các quy tắc an toàn trong phòng thực hành|Bài 3. Thực hành tính sai số trong phép đo. Ghi kết quả đo',
'Chương II. Động học|Bài 4. Độ dịch chuyển và quãng đường đi được|Bài 5. Tốc độ và vận tốc|Bài 7. Đồ thị độ dịch chuyển – thời gian|Bài 8. Chuyển động biến đổi. Gia tốc|Bài 9. Chuyển động thẳng biến đổi đều|Bài 10. Sự rơi tự do|Bài 12. Chuyển động ném',
'Chương III. Động lực học|Bài 13. Tổng hợp và phân tích lực. Cân bằng lực|Bài 14. Định luật 1 Newton|Bài 15. Định luật 2 Newton|Bài 16. Định luật 3 Newton|Bài 17. Trọng lực và lực căng|Bài 18. Lực ma sát|Bài 19. Lực cản và lực nâng|Bài 21. Moment lực. Cân bằng của vật rắn',
'Chương IV. Năng lượng, công, công suất|Bài 23. Năng lượng. Công cơ học|Bài 24. Công suất|Bài 25. Động năng, thế năng|Bài 26. Cơ năng và định luật bảo toàn cơ năng|Bài 27. Hiệu suất',
'Chương V. Động lượng|Bài 28. Động lượng|Bài 29. Định luật bảo toàn động lượng',
'Chương VI. Chuyển động tròn|Bài 31. Động học của chuyển động tròn đều|Bài 32. Lực hướng tâm và gia tốc hướng tâm',
'Chương VII. Biến dạng của vật rắn. Áp suất chất lỏng|Bài 33. Biến dạng của vật rắn|Bài 34. Khối lượng riêng. Áp suất chất lỏng'],
11:['Chương I. Dao động|Bài 1. Dao động điều hoà|Bài 2. Mô tả dao động điều hoà|Bài 3. Vận tốc, gia tốc trong dao động điều hoà|Bài 5. Động năng. Thế năng. Sự chuyển hoá năng lượng trong dao động điều hoà|Bài 6. Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng',
'Chương II. Sóng|Bài 8. Mô tả sóng|Bài 9. Sóng ngang. Sóng dọc. Sự truyền năng lượng của sóng cơ|Bài 11. Sóng điện từ|Bài 12. Giao thoa sóng|Bài 13. Sóng dừng',
'Chương III. Điện trường|Bài 16. Lực tương tác giữa hai điện tích|Bài 17. Khái niệm điện trường|Bài 18. Điện trường đều|Bài 19. Thế năng điện|Bài 20. Điện thế|Bài 21. Tụ điện',
'Chương IV. Dòng điện. Mạch điện|Bài 22. Cường độ dòng điện|Bài 23. Điện trở. Định luật Ohm|Bài 24. Nguồn điện|Bài 25. Năng lượng và công suất điện'],
12:['Chương I. Vật lí nhiệt|Bài 1. Cấu trúc của chất. Sự chuyển thể|Bài 2. Nội năng. Định luật 1 của nhiệt động lực học|Bài 3. Nhiệt độ. Thang nhiệt độ – nhiệt kế|Bài 4. Nhiệt dung riêng|Bài 5. Nhiệt nóng chảy riêng|Bài 6. Nhiệt hoá hơi riêng',
'Chương II. Khí lí tưởng|Bài 8. Mô hình động học phân tử chất khí|Bài 9. Định luật Boyle|Bài 10. Định luật Charles|Bài 11. Phương trình trạng thái của khí lí tưởng|Bài 12. Áp suất khí theo mô hình động học phân tử|Bài 13. Động năng phân tử',
'Chương III. Từ trường|Bài 14. Từ trường|Bài 15. Lực từ tác dụng lên dây dẫn mang dòng điện. Cảm ứng từ|Bài 16. Từ thông. Hiện tượng cảm ứng điện từ|Bài 17. Máy phát điện xoay chiều|Bài 18. Ứng dụng hiện tượng cảm ứng điện từ|Bài 19. Điện từ trường. Mô hình sóng điện từ',
'Chương IV. Vật lí hạt nhân và phóng xạ|Bài 21. Cấu trúc hạt nhân|Bài 22. Phản ứng hạt nhân và năng lượng liên kết|Bài 23. Hiện tượng phóng xạ|Bài 24. Công nghiệp hạt nhân|Bài 25. Ứng dụng hạt nhân trong y học']},
hoa:{
10:['Chương 1. Cấu tạo nguyên tử|Bài 1. Thành phần của nguyên tử|Bài 2. Nguyên tố hoá học|Bài 3. Cấu trúc lớp vỏ electron nguyên tử',
'Chương 2. Bảng tuần hoàn các nguyên tố hoá học|Bài 5. Cấu tạo của bảng tuần hoàn|Bài 6. Xu hướng biến đổi một số tính chất|Bài 7. Xu hướng biến đổi thành phần và tính chất của hợp chất|Bài 8. Định luật tuần hoàn. Ý nghĩa của bảng tuần hoàn',
'Chương 3. Liên kết hoá học|Bài 10. Quy tắc octet|Bài 11. Liên kết ion|Bài 12. Liên kết cộng hoá trị|Bài 13. Liên kết hydrogen và tương tác van der Waals',
'Chương 4. Phản ứng oxi hoá – khử|Bài 15. Phản ứng oxi hoá – khử',
'Chương 5. Năng lượng hoá học|Bài 17. Biến thiên enthalpy trong các phản ứng hoá học',
'Chương 6. Tốc độ phản ứng|Bài 19. Tốc độ phản ứng',
'Chương 7. Nguyên tố nhóm VIIA (Halogen)|Bài 21. Nhóm halogen|Bài 22. Hydrogen halide. Muối halide'],
11:['Chương 1. Cân bằng hoá học|Bài 1. Khái niệm về cân bằng hoá học|Bài 2. Cân bằng trong dung dịch nước',
'Chương 2. Nitrogen và sulfur|Bài 4. Nitrogen|Bài 5. Ammonia. Muối ammonium|Bài 6. Một số hợp chất của nitrogen với oxygen|Bài 7. Sulfur và sulfur dioxide|Bài 8. Sulfuric acid và muối sulfate',
'Chương 3. Đại cương về hoá học hữu cơ|Bài 10. Hợp chất hữu cơ và hoá học hữu cơ|Bài 11. Phương pháp tách biệt và tinh chế|Bài 12. Công thức phân tử hợp chất hữu cơ|Bài 13. Cấu tạo hoá học hợp chất hữu cơ',
'Chương 4. Hydrocarbon|Bài 15. Alkane|Bài 16. Hydrocarbon không no|Bài 17. Arene (hydrocarbon thơm)',
'Chương 5. Dẫn xuất halogen – alcohol – phenol|Bài 19. Dẫn xuất halogen|Bài 20. Alcohol|Bài 21. Phenol',
'Chương 6. Hợp chất carbonyl – carboxylic acid|Bài 23. Hợp chất carbonyl|Bài 24. Carboxylic acid'],
12:['Chương 1. Ester – Lipid|Bài 1. Ester – Lipid|Bài 2. Xà phòng và chất giặt rửa',
'Chương 2. Carbohydrate|Bài 4. Giới thiệu về carbohydrate. Glucose và fructose|Bài 5. Saccharose và maltose|Bài 6. Tinh bột và cellulose',
'Chương 3. Hợp chất chứa nitrogen|Bài 8. Amine|Bài 9. Amino acid và peptide|Bài 10. Protein và enzyme',
'Chương 4. Polymer|Bài 12. Đại cương về polymer|Bài 13. Vật liệu polymer',
'Chương 5. Pin điện và điện phân|Bài 15. Thế điện cực và nguồn điện hoá học|Bài 16. Điện phân',
'Chương 6. Đại cương về kim loại|Bài 18. Cấu tạo và liên kết trong tinh thể kim loại|Bài 19. Tính chất vật lí và tính chất hoá học của kim loại|Bài 20. Kim loại trong tự nhiên và phương pháp tách kim loại|Bài 21. Hợp kim|Bài 22. Sự ăn mòn kim loại',
'Chương 7. Nguyên tố nhóm IA và nhóm IIA|Bài 24. Nguyên tố nhóm IA|Bài 25. Nguyên tố nhóm IIA',
'Chương 8. Sơ lược về kim loại chuyển tiếp dãy thứ nhất và phức chất|Bài 27. Đại cương về kim loại chuyển tiếp dãy thứ nhất|Bài 28. Sơ lược về phức chất']},
sinh:{
10:['Phần 1. Giới thiệu chung về thế giới sống|Bài 1. Giới thiệu khái quát môn Sinh học|Bài 2. Phương pháp nghiên cứu và học tập môn Sinh học|Bài 3. Các cấp độ tổ chức của thế giới sống',
'Chương 1. Thành phần hoá học của tế bào|Bài 4. Khái quát về tế bào|Bài 5. Các nguyên tố hoá học và nước|Bài 6. Các phân tử sinh học',
'Chương 2. Cấu trúc tế bào|Bài 7. Tế bào nhân sơ|Bài 8. Tế bào nhân thực',
'Chương 3. Trao đổi chất qua màng và truyền tin tế bào|Bài 10. Trao đổi chất qua màng sinh chất|Bài 12. Truyền tin tế bào',
'Chương 4. Chuyển hoá năng lượng trong tế bào|Bài 13. Khái quát chuyển hoá vật chất và năng lượng|Bài 14. Phân giải và tổng hợp các chất trong tế bào',
'Chương 5. Chu kì tế bào và phân bào|Bài 16. Chu kì tế bào và nguyên phân|Bài 17. Giảm phân',
'Chương 6. Công nghệ tế bào và vi sinh vật|Bài 19. Công nghệ tế bào|Bài 20. Sự đa dạng và phương pháp nghiên cứu vi sinh vật|Bài 22. Quá trình tổng hợp và phân giải ở vi sinh vật|Bài 24. Virus'],
11:['Chương 1. Trao đổi chất và chuyển hoá năng lượng ở sinh vật|Bài 2. Trao đổi nước và khoáng ở thực vật|Bài 3. Quang hợp ở thực vật|Bài 5. Hô hấp ở thực vật|Bài 6. Dinh dưỡng và tiêu hoá ở động vật|Bài 7. Hô hấp ở động vật|Bài 8. Tuần hoàn ở động vật|Bài 10. Miễn dịch ở động vật và người|Bài 11. Bài tiết và cân bằng nội môi',
'Chương 2. Cảm ứng ở sinh vật|Bài 13. Cảm ứng ở thực vật|Bài 14. Cảm ứng ở động vật|Bài 15. Tập tính ở động vật',
'Chương 3. Sinh trưởng và phát triển ở sinh vật|Bài 17. Sinh trưởng và phát triển ở thực vật|Bài 18. Sinh trưởng và phát triển ở động vật',
'Chương 4. Sinh sản ở sinh vật|Bài 20. Sinh sản ở thực vật|Bài 21. Sinh sản ở động vật'],
12:['Chương 1. Di truyền phân tử|Bài 1. DNA và cơ chế tái bản DNA|Bài 2. Gene, quá trình truyền đạt thông tin di truyền và hệ gene|Bài 3. Điều hoà biểu hiện gene|Bài 4. Đột biến gene',
'Chương 2. Di truyền nhiễm sắc thể|Bài 6. Cơ sở nhiễm sắc thể của sự di truyền|Bài 7. Đột biến nhiễm sắc thể|Bài 8. Học thuyết di truyền Mendel|Bài 9. Mở rộng học thuyết Mendel|Bài 10. Di truyền liên kết giới tính, liên kết gene và hoán vị gene|Bài 11. Di truyền gene ngoài nhân',
'Chương 3. Di truyền quần thể và di truyền học người|Bài 14. Di truyền quần thể|Bài 15. Di truyền học người',
'Chương 4. Bằng chứng và cơ chế tiến hoá|Bài 17. Các bằng chứng tiến hoá|Bài 18. Quan niệm của Darwin về chọn lọc tự nhiên|Bài 19. Thuyết tiến hoá tổng hợp hiện đại|Bài 21. Sự phát sinh và phát triển sự sống trên Trái Đất',
'Chương 5. Sinh thái học|Bài 22. Môi trường và các nhân tố sinh thái|Bài 23. Quần thể sinh vật|Bài 24. Quần xã sinh vật|Bài 25. Hệ sinh thái|Bài 26. Chu trình sinh địa hoá và sinh quyển|Bài 28. Phát triển bền vững']},
dia:{
10:['Phần một. Một số vấn đề chung|Bài 1. Môn Địa lí với định hướng nghề nghiệp|Bài 2. Phương pháp biểu hiện các đối tượng địa lí trên bản đồ|Bài 3. Sử dụng bản đồ trong học tập và đời sống',
'Chương 1. Trái Đất|Bài 5. Sự hình thành Trái Đất, vỏ Trái Đất và vật liệu cấu tạo|Bài 6. Hệ quả địa lí các chuyển động chính của Trái Đất',
'Chương 2. Thạch quyển|Bài 7. Nội lực|Bài 8. Ngoại lực',
'Chương 3. Khí quyển|Bài 9. Khí quyển, nhiệt độ không khí|Bài 10. Khí áp và gió|Bài 11. Mưa',
'Chương 4. Thuỷ quyển|Bài 13. Thuỷ quyển, nước trên lục địa|Bài 14. Nước biển và đại dương',
'Chương 5. Thổ nhưỡng quyển và sinh quyển|Bài 16. Thổ nhưỡng quyển|Bài 17. Sinh quyển',
'Chương 6. Một số quy luật của vỏ địa lí|Bài 18. Vỏ địa lí. Quy luật thống nhất và hoàn chỉnh|Bài 19. Quy luật địa đới và phi địa đới',
'Chương 7. Địa lí dân cư|Bài 20. Dân số và sự phát triển dân số thế giới|Bài 21. Phân bố dân cư và đô thị hoá',
'Chương 8. Nguồn lực, cơ cấu kinh tế|Bài 22. Nguồn lực phát triển kinh tế|Bài 23. Cơ cấu nền kinh tế, GDP và GNI',
'Chương 9–11. Địa lí các ngành kinh tế|Bài 24. Nông nghiệp, lâm nghiệp, thuỷ sản|Bài 27. Công nghiệp|Bài 30. Dịch vụ|Bài 34. Môi trường và phát triển bền vững'],
11:['Phần một. Kinh tế – xã hội thế giới|Bài 1. Sự khác biệt về trình độ phát triển kinh tế – xã hội|Bài 2. Toàn cầu hoá và khu vực hoá kinh tế|Bài 3. Một số tổ chức khu vực và quốc tế|Bài 4. Một số vấn đề an ninh toàn cầu',
'Khu vực Mỹ La-tinh|Bài 6. Tự nhiên, dân cư, xã hội và kinh tế Mỹ La-tinh',
'Liên minh châu Âu (EU)|Bài 8. Liên minh châu Âu – một liên kết kinh tế khu vực lớn',
'Khu vực Đông Nam Á|Bài 10. Tự nhiên, dân cư, xã hội và kinh tế Đông Nam Á|Bài 11. Hiệp hội các quốc gia Đông Nam Á (ASEAN)',
'Khu vực Tây Nam Á|Bài 13. Tự nhiên, dân cư, xã hội và kinh tế Tây Nam Á',
'Hoa Kỳ|Bài 15. Vị trí địa lí, điều kiện tự nhiên, dân cư và xã hội Hoa Kỳ|Bài 16. Kinh tế Hoa Kỳ',
'Liên bang Nga|Bài 18. Tự nhiên, dân cư, xã hội và kinh tế Liên bang Nga',
'Nhật Bản|Bài 20. Tự nhiên, dân cư, xã hội Nhật Bản|Bài 21. Kinh tế Nhật Bản',
'Trung Quốc|Bài 23. Tự nhiên, dân cư, xã hội Trung Quốc|Bài 24. Kinh tế Trung Quốc',
'Ô-xtrây-li-a và Cộng hoà Nam Phi|Bài 26. Kinh tế Ô-xtrây-li-a|Bài 28. Kinh tế Cộng hoà Nam Phi'],
12:['Địa lí tự nhiên Việt Nam|Bài 1. Vị trí địa lí và phạm vi lãnh thổ|Bài 2. Thiên nhiên nhiệt đới ẩm gió mùa|Bài 3. Sự phân hoá đa dạng của thiên nhiên|Bài 4. Vấn đề sử dụng hợp lí tài nguyên và bảo vệ môi trường',
'Địa lí dân cư|Bài 6. Dân số Việt Nam|Bài 7. Lao động và việc làm|Bài 8. Đô thị hoá',
'Địa lí các ngành kinh tế|Bài 10. Chuyển dịch cơ cấu kinh tế|Bài 11. Vấn đề phát triển nông nghiệp, lâm nghiệp, thuỷ sản|Bài 14. Một số ngành công nghiệp|Bài 17. Giao thông vận tải và bưu chính viễn thông|Bài 18. Thương mại và du lịch',
'Địa lí các vùng kinh tế|Bài 20. Trung du và miền núi Bắc Bộ|Bài 21. Đồng bằng sông Hồng|Bài 22. Bắc Trung Bộ|Bài 23. Duyên hải Nam Trung Bộ|Bài 24. Tây Nguyên|Bài 25. Đông Nam Bộ|Bài 26. Đồng bằng sông Cửu Long|Bài 27. Phát triển kinh tế và đảm bảo quốc phòng an ninh ở Biển Đông']},
su:{
10:['Lịch sử và Sử học|Bài 1. Hiện thực lịch sử và nhận thức lịch sử|Bài 2. Tri thức lịch sử và cuộc sống|Bài 3. Sử học với các lĩnh vực khoa học khác',
'Các nền văn minh thế giới thời kì cổ – trung đại|Bài 4. Khái niệm văn minh. Một số nền văn minh phương Đông|Bài 5. Một số nền văn minh phương Tây',
'Các cuộc cách mạng công nghiệp|Bài 6. Cách mạng công nghiệp thời kì cận đại|Bài 7. Cách mạng công nghiệp thời kì hiện đại',
'Văn minh Đông Nam Á|Bài 8. Hành trình phát triển và thành tựu của văn minh Đông Nam Á',
'Một số nền văn minh trên đất nước Việt Nam|Bài 9. Văn minh Văn Lang – Âu Lạc, Champa, Phù Nam|Bài 10. Văn minh Đại Việt',
'Cộng đồng các dân tộc Việt Nam|Bài 11. Các dân tộc trên đất nước Việt Nam|Bài 12. Khối đại đoàn kết dân tộc'],
11:['Cách mạng tư sản và sự phát triển của chủ nghĩa tư bản|Bài 1. Một số vấn đề chung về cách mạng tư sản|Bài 2. Sự xác lập và phát triển của chủ nghĩa tư bản',
'Chủ nghĩa xã hội từ năm 1917 đến nay|Bài 3. Sự hình thành Liên bang Cộng hoà xã hội chủ nghĩa Xô viết|Bài 4. Sự phát triển của chủ nghĩa xã hội từ sau Chiến tranh thế giới thứ hai',
'Quá trình giành độc lập dân tộc của các quốc gia Đông Nam Á|Bài 5. Quá trình xâm lược và cai trị của chủ nghĩa thực dân ở Đông Nam Á|Bài 6. Hành trình đi đến độc lập dân tộc ở Đông Nam Á',
'Chiến tranh bảo vệ Tổ quốc|Bài 7. Chiến tranh bảo vệ Tổ quốc trong lịch sử Việt Nam (trước 1945)|Bài 8. Một số cuộc khởi nghĩa và chiến tranh giải phóng',
'Cải cách trong lịch sử VN|Bài 9. Cuộc cải cách của Hồ Quý Ly và triều Hồ|Bài 10. Cuộc cải cách của Lê Thánh Tông|Bài 11. Cuộc cải cách của Minh Mạng',
'Lịch sử bảo vệ chủ quyền ở Biển Đông|Bài 12. Vị trí và tầm quan trọng của Biển Đông|Bài 13. Việt Nam và Biển Đông'],
12:['Thế giới sau năm 1945|Bài 1. Liên hợp quốc|Bài 2. Trật tự thế giới trong Chiến tranh lạnh|Bài 3. Trật tự thế giới sau Chiến tranh lạnh|Bài 4. Sự ra đời và phát triển của ASEAN|Bài 5. Cộng đồng ASEAN',
'Cách mạng tháng Tám năm 1945|Bài 6. Cách mạng tháng Tám năm 1945',
'Kháng chiến chống Pháp và chống Mỹ|Bài 7. Cuộc kháng chiến chống thực dân Pháp (1945–1954)|Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (1954–1975)|Bài 9. Đấu tranh bảo vệ Tổ quốc từ sau tháng 4–1975',
'Công cuộc Đổi mới từ 1986|Bài 10. Khái quát về công cuộc Đổi mới từ năm 1986 đến nay|Bài 11. Thành tựu cơ bản và bài học của công cuộc Đổi mới',
'Lịch sử đối ngoại của Việt Nam thời cận – hiện đại|Bài 12. Hoạt động đối ngoại của Việt Nam trong đấu tranh giành độc lập|Bài 13. Hoạt động đối ngoại từ 1975 đến nay',
'Hồ Chí Minh trong lịch sử Việt Nam|Bài 14. Khái quát về cuộc đời và sự nghiệp của Hồ Chí Minh|Bài 15. Dấu ấn Hồ Chí Minh trong lòng nhân dân thế giới và Việt Nam']},
gdktpl:{
10:['Nền kinh tế và các chủ thể|Bài 1. Nền kinh tế và các hoạt động của nền kinh tế|Bài 2. Các chủ thể của nền kinh tế',
'Thị trường|Bài 3. Thị trường|Bài 4. Cơ chế thị trường',
'Ngân sách nhà nước|Bài 5. Ngân sách nhà nước|Bài 6. Thuế',
'Sản xuất kinh doanh và tín dụng|Bài 7. Sản xuất kinh doanh và các mô hình sản xuất kinh doanh|Bài 8. Tín dụng|Bài 9. Dịch vụ tín dụng|Bài 10. Lập kế hoạch tài chính cá nhân',
'Pháp luật|Bài 11. Khái niệm, đặc điểm và vai trò của pháp luật|Bài 12. Hệ thống pháp luật và văn bản pháp luật Việt Nam|Bài 13. Thực hiện pháp luật',
'Hiến pháp nước CHXHCN Việt Nam|Bài 14. Giới thiệu về Hiến pháp|Bài 15. Hiến pháp về chế độ chính trị|Bài 18. Hiến pháp về bộ máy nhà nước'],
11:['Cạnh tranh, cung cầu|Bài 1. Cạnh tranh trong kinh tế thị trường|Bài 2. Cung – cầu trong kinh tế thị trường',
'Lạm phát, thất nghiệp|Bài 3. Lạm phát|Bài 4. Thất nghiệp',
'Thị trường lao động, việc làm|Bài 5. Thị trường lao động và việc làm',
'Ý tưởng, cơ hội kinh doanh và đạo đức kinh doanh|Bài 6. Ý tưởng, cơ hội kinh doanh và các năng lực cần thiết|Bài 7. Đạo đức kinh doanh|Bài 8. Văn hoá tiêu dùng',
'Quyền bình đẳng|Bài 9. Quyền bình đẳng của công dân trước pháp luật|Bài 10. Bình đẳng giới|Bài 11. Bình đẳng giữa các dân tộc, tôn giáo',
'Quyền tự do cơ bản|Bài 12. Quyền và nghĩa vụ công dân về bầu cử và ứng cử|Bài 16. Quyền bất khả xâm phạm về thân thể|Bài 18. Quyền bất khả xâm phạm về chỗ ở|Bài 21. Quyền tự do ngôn luận, báo chí'],
12:['Tăng trưởng và phát triển kinh tế|Bài 1. Tăng trưởng và phát triển kinh tế',
'Hội nhập kinh tế quốc tế|Bài 2. Hội nhập kinh tế quốc tế',
'Bảo hiểm và an sinh xã hội|Bài 3. Bảo hiểm|Bài 4. An sinh xã hội',
'Quản lí thu chi và kinh doanh|Bài 5. Lập kế hoạch kinh doanh|Bài 6. Trách nhiệm xã hội của doanh nghiệp|Bài 7. Quản lí thu, chi trong gia đình',
'Quyền và nghĩa vụ công dân|Bài 8. Quyền và nghĩa vụ công dân về kinh doanh và nộp thuế|Bài 9. Quyền và nghĩa vụ công dân về sở hữu tài sản|Bài 11. Quyền và nghĩa vụ công dân về hôn nhân và gia đình|Bài 12. Quyền và nghĩa vụ công dân về học tập|Bài 13. Quyền và nghĩa vụ công dân về bảo vệ môi trường',
'Pháp luật quốc tế|Bài 15. Những vấn đề chung về công pháp quốc tế|Bài 16. Công pháp quốc tế về dân cư, lãnh thổ và biên giới quốc gia|Bài 17. Các nguyên tắc cơ bản của WTO']},
tin:{
10:['Máy tính và xã hội tri thức|Bài 1. Thông tin và xử lí thông tin|Bài 2. Vai trò của thiết bị thông minh và tin học đối với xã hội|Bài 3. Một số kiểu dữ liệu và dữ liệu văn bản|Bài 4. Hệ nhị phân và dữ liệu số nguyên',
'Mạng máy tính và Internet|Bài 7. Thực hành sử dụng thiết bị số thông dụng|Bài 8. Mạng máy tính trong cuộc sống hiện đại|Bài 9. An toàn trên không gian mạng',
'Đạo đức, pháp luật và văn hoá trong môi trường số|Bài 11. Ứng xử trên môi trường số. Nghĩa vụ tôn trọng bản quyền',
'Ứng dụng tin học|Bài 12. Phần mềm thiết kế đồ hoạ|Bài 14. Làm việc với đối tượng đường và văn bản',
'Lập trình Python|Bài 16. Ngôn ngữ lập trình bậc cao và Python|Bài 17. Biến và lệnh gán|Bài 18. Các lệnh vào ra đơn giản|Bài 19. Câu lệnh rẽ nhánh if|Bài 20. Câu lệnh lặp for|Bài 21. Câu lệnh lặp while|Bài 23. Một số lệnh làm việc với dữ liệu danh sách|Bài 25. Một số lệnh làm việc với xâu kí tự|Bài 26. Hàm trong Python'],
11:['Hệ điều hành|Bài 1. Hệ điều hành|Bài 2. Thực hành sử dụng hệ điều hành|Bài 3. Phần mềm nguồn mở và phần mềm chạy trên Internet',
'Cơ sở dữ liệu|Bài 10. Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí|Bài 11. Cơ sở dữ liệu|Bài 12. Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu|Bài 13. Cơ sở dữ liệu quan hệ|Bài 14. SQL – ngôn ngữ truy vấn có cấu trúc',
'Kĩ thuật lập trình|Bài 19. Dữ liệu mảng một chiều và hai chiều|Bài 20. Thực hành dữ liệu mảng|Bài 21. Thuật toán tìm kiếm|Bài 22. Thuật toán sắp xếp|Bài 24. Đánh giá độ phức tạp thời gian thuật toán'],
12:['Trí tuệ nhân tạo|Bài 1. Làm quen với trí tuệ nhân tạo|Bài 2. Trí tuệ nhân tạo trong khoa học và đời sống',
'Mạng máy tính|Bài 3. Một số thiết bị mạng thông dụng|Bài 4. Giao thức mạng|Bài 5. Thực hành chia sẻ tài nguyên trên mạng',
'Đạo đức, pháp luật trong môi trường số|Bài 6. Giao tiếp và ứng xử trong không gian mạng',
'Tạo trang web HTML/CSS|Bài 7. HTML và cấu trúc trang web|Bài 8. Định dạng văn bản|Bài 9. Tạo danh sách, bảng|Bài 10. Tạo liên kết|Bài 11. Chèn tệp đa phương tiện và khung nội tuyến|Bài 12. Tạo biểu mẫu|Bài 13. Khái niệm, vai trò của CSS|Bài 14. Định dạng khung',
'Định hướng nghề nghiệp|Bài 19. Dịch vụ sửa chữa và bảo trì máy tính|Bài 20. Nhóm nghề quản trị thuộc ngành công nghệ thông tin']},
cn:{
10:['Công nghệ và đời sống|Bài 1. Khoa học, kĩ thuật và công nghệ|Bài 2. Hệ thống kĩ thuật|Bài 3. Công nghệ phổ biến|Bài 4. Một số công nghệ mới|Bài 5. Đánh giá công nghệ|Bài 6. Cách mạng công nghiệp',
'Vẽ kĩ thuật|Bài 11. Tiêu chuẩn trình bày bản vẽ kĩ thuật|Bài 12. Hình chiếu vuông góc|Bài 13. Mặt cắt và hình cắt|Bài 14. Hình chiếu trục đo|Bài 16. Bản vẽ cơ khí|Bài 17. Bản vẽ xây dựng',
'Thiết kế kĩ thuật|Bài 19. Khái quát về thiết kế kĩ thuật|Bài 20. Quy trình thiết kế kĩ thuật'],
11:['Cơ khí chế tạo|Bài 1. Khái quát về cơ khí chế tạo|Bài 2. Vật liệu cơ khí|Bài 4. Phương pháp gia công cơ khí|Bài 6. Sản xuất cơ khí tự động',
'Cơ khí động lực|Bài 9. Khái quát về cơ khí động lực',
'Động cơ đốt trong|Bài 11. Khái quát về động cơ đốt trong|Bài 12. Nguyên lí làm việc của động cơ đốt trong|Bài 13. Thân máy và cơ cấu trục khuỷu thanh truyền|Bài 15. Các hệ thống trong động cơ đốt trong',
'Ô tô|Bài 18. Khái quát về ô tô|Bài 19. Hệ thống truyền lực'],
12:['Kĩ thuật điện|Bài 1. Khái quát về kĩ thuật điện|Bài 3. Hệ thống điện quốc gia|Bài 5. Mạch điện xoay chiều ba pha|Bài 7. Hệ thống điện trong gia đình|Bài 9. An toàn điện',
'Kĩ thuật điện tử|Bài 11. Khái quát về kĩ thuật điện tử|Bài 12. Linh kiện điện tử|Bài 14. Mạch điện tử tương tự|Bài 16. Mạch điện tử số|Bài 18. Vi điều khiển']},
anh:{
10:['Phonetics','Vocabulary','Grammar','Communication','Reading','Writing'],
11:['Phonetics','Vocabulary','Grammar','Communication','Reading','Writing'],
12:['Phonetics','Vocabulary','Grammar','Communication','Reading','Writing']},
van:{
10:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận'],
11:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận'],
12:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận']}
};
/* Bài học (Unit) Tiếng Anh Global Success & bài học Ngữ văn KNTT dùng làm "bài" cho mọi phần kĩ năng */
const UNITS = {
  anh:{10:['Unit 1. Family life','Unit 2. Humans and the environment','Unit 3. Music','Unit 4. For a better community','Unit 5. Inventions','Unit 6. Gender equality','Unit 7. Viet Nam and international organisations','Unit 8. New ways to learn','Unit 9. Protecting the environment','Unit 10. Ecotourism'],
    11:['Unit 1. A long and healthy life','Unit 2. The generation gap','Unit 3. Cities of the future','Unit 4. ASEAN and Viet Nam','Unit 5. Global warming','Unit 6. Preserving our heritage','Unit 7. Education options for school-leavers','Unit 8. Becoming independent','Unit 9. Social issues','Unit 10. The ecosystem'],
    12:['Unit 1. Life stories we admire','Unit 2. A multicultural world','Unit 3. Green living','Unit 4. Urbanisation','Unit 5. The world of work','Unit 6. Artificial intelligence','Unit 7. The world of mass media','Unit 8. Wildlife conservation','Unit 9. Career paths','Unit 10. Lifelong learning']},
  van:{10:['Bài 1. Sức hấp dẫn của truyện kể','Bài 2. Vẻ đẹp của thơ ca','Bài 3. Nghệ thuật thuyết phục trong văn nghị luận','Bài 4. Sức sống của sử thi','Bài 5. Tích trò sân khấu dân gian','Bài 6. Nguyễn Trãi – “Dành còn để trợ dân này”','Bài 7. Quyền năng của người kể chuyện','Bài 8. Thế giới đa dạng của thông tin','Bài 9. Hành trang cuộc sống'],
    11:['Bài 1. Câu chuyện và điểm nhìn trong truyện kể','Bài 2. Cấu tứ và hình ảnh trong thơ trữ tình','Bài 3. Cấu trúc của văn bản nghị luận','Bài 4. Tự sự trong truyện thơ dân gian và trong thơ trữ tình','Bài 5. Nhân vật và xung đột trong bi kịch','Bài 6. Nguyễn Du – “Những điều trông thấy mà đau đớn lòng”','Bài 7. Ghi chép và tưởng tượng trong kí','Bài 8. Cấu trúc của văn bản thông tin','Bài 9. Lựa chọn và hành động'],
    12:['Bài 1. Khả năng lớn lao của tiểu thuyết','Bài 2. Những thế giới thơ','Bài 3. Lập luận trong văn bản nghị luận','Bài 4. Yếu tố kì ảo trong truyện kể','Bài 5. Tiếng cười của hài kịch','Bài 6. Hồ Chí Minh – “Văn hoá phải soi đường cho quốc dân đi”','Bài 7. Sức sống của sử thi và truyện kể dân gian','Bài 8. Dấu ấn cá nhân trong kí','Bài 9. Hành trang vào đời']}
};
const CURRIC = (()=>{ const C={}; for(const s in CURRIC_RAW){ C[s]={}; for(const g in CURRIC_RAW[s]){ C[s][g]=CURRIC_RAW[s][g].map(line=>{ const [n,...b]=line.split('|'); return {n,b:b.length?b:((UNITS[s]||{})[g]||[]).slice()}; }); } } return C; })();
/* Tên chủ đề cũ (bản 1.x–2.x) → tên chương mới */
const TOPIC_ALIAS = {
 toan:{'Mệnh đề và tập hợp':'Chương I. Mệnh đề và tập hợp','Bất phương trình bậc nhất hai ẩn':'Chương II. Bất phương trình và hệ bất phương trình bậc nhất hai ẩn','Hệ thức lượng trong tam giác':'Chương III. Hệ thức lượng trong tam giác','Vectơ':'Chương IV. Vectơ','Hàm số bậc hai và đồ thị':'Chương VI. Hàm số, đồ thị và ứng dụng','Phương pháp toạ độ trong mặt phẳng':'Chương VII. Phương pháp toạ độ trong mặt phẳng','Đại số tổ hợp':'Chương VIII. Đại số tổ hợp','Thống kê và xác suất':'Chương IX. Tính xác suất theo định nghĩa cổ điển',
   'Hàm số lượng giác và phương trình lượng giác':'Chương I. Hàm số lượng giác và phương trình lượng giác','Dãy số, cấp số cộng, cấp số nhân':'Chương II. Dãy số. Cấp số cộng và cấp số nhân','Giới hạn. Hàm số liên tục':'Chương V. Giới hạn. Hàm số liên tục','Hàm số mũ và hàm số lôgarit':'Chương VI. Hàm số mũ và hàm số lôgarit','Đạo hàm':'Chương IX. Đạo hàm','Quan hệ song song':'Chương IV. Quan hệ song song trong không gian','Quan hệ vuông góc':'Chương VII. Quan hệ vuông góc trong không gian','Xác suất':'Chương VIII. Các quy tắc tính xác suất',
   'Ứng dụng đạo hàm để khảo sát hàm số':'Chương I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số','Nguyên hàm và tích phân':'Chương IV. Nguyên hàm và tích phân','Vectơ và toạ độ trong không gian':'Chương II. Vectơ và hệ trục toạ độ trong không gian','Phương pháp toạ độ trong không gian':'Chương V. Phương pháp toạ độ trong không gian','Thống kê mẫu số liệu ghép nhóm':'Chương III. Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm','Xác suất có điều kiện':'Chương VI. Xác suất có điều kiện'},
 li:{'Động học':'Chương II. Động học','Động lực học':'Chương III. Động lực học','Năng lượng, công, công suất':'Chương IV. Năng lượng, công, công suất','Động lượng':'Chương V. Động lượng','Dao động':'Chương I. Dao động','Sóng':'Chương II. Sóng','Điện trường':'Chương III. Điện trường','Dòng điện, mạch điện':'Chương IV. Dòng điện. Mạch điện','Vật lí nhiệt':'Chương I. Vật lí nhiệt','Khí lí tưởng':'Chương II. Khí lí tưởng','Từ trường':'Chương III. Từ trường','Vật lí hạt nhân':'Chương IV. Vật lí hạt nhân và phóng xạ'},
 hoa:{'Cấu tạo nguyên tử':'Chương 1. Cấu tạo nguyên tử','Bảng tuần hoàn':'Chương 2. Bảng tuần hoàn các nguyên tố hoá học','Liên kết hoá học':'Chương 3. Liên kết hoá học','Phản ứng oxi hoá – khử':'Chương 4. Phản ứng oxi hoá – khử','Cân bằng hoá học':'Chương 1. Cân bằng hoá học','Nitrogen và sulfur':'Chương 2. Nitrogen và sulfur','Hydrocarbon':'Chương 4. Hydrocarbon','Dẫn xuất halogen – alcohol – phenol':'Chương 5. Dẫn xuất halogen – alcohol – phenol','Ester – Lipid':'Chương 1. Ester – Lipid','Carbohydrate':'Chương 2. Carbohydrate','Hợp chất chứa nitrogen':'Chương 3. Hợp chất chứa nitrogen','Polymer':'Chương 4. Polymer','Pin điện và điện phân':'Chương 5. Pin điện và điện phân','Đại cương kim loại':'Chương 6. Đại cương về kim loại','Nguyên tố nhóm IA, IIA':'Chương 7. Nguyên tố nhóm IA và nhóm IIA'},
 sinh:{'Thành phần hoá học của tế bào':'Chương 1. Thành phần hoá học của tế bào','Cấu trúc tế bào':'Chương 2. Cấu trúc tế bào','Trao đổi chất ở tế bào':'Chương 3. Trao đổi chất qua màng và truyền tin tế bào','Phân bào':'Chương 5. Chu kì tế bào và phân bào','Trao đổi chất ở thực vật':'Chương 1. Trao đổi chất và chuyển hoá năng lượng ở sinh vật','Trao đổi chất ở động vật':'Chương 1. Trao đổi chất và chuyển hoá năng lượng ở sinh vật','Cảm ứng':'Chương 2. Cảm ứng ở sinh vật','Sinh trưởng và phát triển':'Chương 3. Sinh trưởng và phát triển ở sinh vật','Di truyền phân tử':'Chương 1. Di truyền phân tử','Di truyền nhiễm sắc thể':'Chương 2. Di truyền nhiễm sắc thể','Di truyền quần thể':'Chương 3. Di truyền quần thể và di truyền học người','Tiến hoá':'Chương 4. Bằng chứng và cơ chế tiến hoá','Sinh thái học':'Chương 5. Sinh thái học'},
 dia:{'Trái Đất':'Chương 1. Trái Đất','Thạch quyển':'Chương 2. Thạch quyển','Khí quyển':'Chương 3. Khí quyển','Thuỷ quyển':'Chương 4. Thuỷ quyển','Kinh tế – xã hội thế giới':'Phần một. Kinh tế – xã hội thế giới'}
};
/* Từ khoá gợi ý bài cho câu chưa gắn bài (môn Toán & một số môn) */
const LESSON_KEYS = {
 toan:{12:[['tiệm cận','Bài 3.'],['lớn nhất|nhỏ nhất|GTLN|GTNN','Bài 2.'],['đồng biến|nghịch biến|cực trị|cực đại|cực tiểu|đơn điệu','Bài 1.'],['đồ thị|bảng biến thiên|đường cong','Bài 4.'],['lợi nhuận|chi phí|hộp|thể tích lớn nhất|vật liệu','Bài 5.'],
     ['nguyên hàm','Bài 11.'],['diện tích hình phẳng|thể tích khối tròn xoay|quay','Bài 13.'],['tích phân|quãng đường','Bài 12.'],['mặt cầu','Bài 17.'],['mặt phẳng','Bài 14.'],['đường thẳng','Bài 15.'],['góc giữa','Bài 16.'],
     ['tứ phân vị|khoảng biến thiên','Bài 9.'],['phương sai|độ lệch chuẩn','Bài 10.'],['Bayes|toàn phần','Bài 19.'],['điều kiện|P\\(A\\|B\\)','Bài 18.'],['toạ độ|Oxyz','Bài 7.'],['vectơ','Bài 6.']],
   11:[['thể tích','Bài 27.'],['khoảng cách','Bài 26.'],['vuông góc với mặt phẳng|SA\\\\perp','Bài 23.'],['góc giữa','Bài 24.'],['cấp số nhân|gấp đôi','Bài 7.'],['cấp số cộng','Bài 6.'],['dãy số','Bài 5.'],['lôgarit|log','Bài 19.'],['mũ','Bài 20.'],['đạo hàm cấp hai','Bài 33.'],['đạo hàm','Bài 32.'],['phương trình lượng giác|sin x|cos x','Bài 4.'],['giới hạn|lim','Bài 16.'],['liên tục','Bài 17.'],['độc lập','Bài 30.'],['xác suất','Bài 29.']],
   10:[['thang|cột đèn|bóng|định lí côsin|định lí sin|diện tích tam giác','Bài 6.'],['parabol|bậc hai|đỉnh','Bài 16.'],['tam thức|dấu','Bài 17.'],['mệnh đề','Bài 1.'],['tập hợp','Bài 2.'],['hoán vị|chỉnh hợp|tổ hợp','Bài 24.'],['quy tắc|bao nhiêu cách','Bài 23.'],['Newton|khai triển','Bài 25.'],['đường tròn','Bài 21.'],['elip|hypebol|conic','Bài 22.'],['đường thẳng','Bài 19.'],['vectơ','Bài 8.'],['xác suất','Bài 26.'],['trung bình|trung vị|mốt','Bài 13.'],['phương sai|độ lệch','Bài 14.']]}
};
function curricOf(s,g){ const base=((CURRIC[s]||{})[g])||[]; const out=base.map(c=>({n:c.n,b:[...c.b]}));
  (typeof DB!=='undefined'&&DB.data?DB.all('topics'):[]).filter(t=>t.subject===s&&+t.grade===+g).forEach(t=>{ let c=out.find(x=>x.n===t.name); if(!c){ c={n:t.name,b:[],custom:true}; out.push(c); } (t.lessons||[]).forEach(b=>{ if(!c.b.includes(b)) c.b.push(b); }); });
  return out; }
function chaptersOf(s,g){ return curricOf(s,g).map(c=>c.n); }
function lessonsOf(s,g,ch){ const c=curricOf(s,g).find(x=>x.n===ch); return c?c.b:[]; }
const chapShort = n => String(n||'').replace(/^(Chương|Phần)\s+[^.]+\.\s*/,'');
/* Chuyển chủ đề cũ → chương mới, gợi ý bài theo từ khoá. Trả về số câu đã đổi. */
function migrateCurric(d){ let n=0; const fix=(o)=>{ const al=(TOPIC_ALIAS[o.subject]||{})[o.topic]; if(al){ o.topic=al; n++; }
    if(o.content&&!o.lesson&&o.subject&&o.grade){ const keys=((LESSON_KEYS[o.subject]||{})[o.grade])||[]; const ls=((CURRIC[o.subject]||{})[o.grade]||[]).find(c=>c.n===o.topic); if(ls){ const txt=(o.content+' '+(o.statements||[]).join(' ')).replace(/\$[^$]*\$/g,m=>m);
        for(const [re,pre] of keys){ if(new RegExp(re,'i').test(txt)){ const b=ls.b.find(x=>x.startsWith(pre)); if(b){ o.lesson=b; n++; break; } } } } } };
  (d.questions||[]).forEach(fix);
  (d.matrices||[]).forEach(mx=>(mx.rows||[]).forEach(r=>{ const al=(TOPIC_ALIAS[mx.subject]||{})[r.topic]; if(al){ r.topic=al; n++; } }));
  if(typeof TEMPLATES!=='undefined') TEMPLATES.forEach(fix);
  return n; }
