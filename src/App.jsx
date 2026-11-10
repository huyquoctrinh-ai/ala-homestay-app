import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, ShieldAlert, CheckCircle, 
  RefreshCw, FileSpreadsheet, Download, Send, Smartphone, 
  Key, Wifi, Bell, DollarSign, Calendar, Lock, Unlock, AlertTriangle, ExternalLink
} from 'lucide-react';

export default function HomestayApp() {
  // Trạng thái chuyển đổi giữa giao diện Chủ nhà (Admin) và Khách đặt phòng (Client Portal)
  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'client'
  
  // Trạng thái Sơ đồ 5 phòng ALA 11 đến ALA 15
  const [rooms, setRooms] = useState([
    { id: 'ala11', name: 'ALA 11 (Gò Vấp) 101', type: 'Phòng 101', status: 'vacant', guest: '', phone: '', checkIn: '', checkOut: '', pin: '829102', wifi: 'ALA_11 / pass1234', battery: 92, revenue: 10151 },
    { id: 'ala12', name: 'ALA 12 (Gò Vấp) 302', type: 'Phòng 302', status: 'occupied', guest: 'Nguyễn Văn A', phone: '0901234567', checkIn: '2026-11-10 14:00', checkOut: '2026-11-11 12:00', pin: '492018', wifi: 'ALA_12 / pass1234', battery: 85, revenue: 11839 },
    { id: 'ala13', name: 'ALA 13 (Gò Vấp) 201', type: 'Phòng 201', status: 'vacant', guest: '', phone: '', checkIn: '', checkOut: '', pin: '519203', wifi: 'ALA_13 / pass1234', battery: 78, revenue: 8423 },
    { id: 'ala14', name: 'ALA 14 (Gò Vấp) 202', type: 'Phòng 202', status: 'cleaning', guest: '', phone: '', checkIn: '', checkOut: '', pin: '730192', wifi: 'ALA_14 / pass1234', battery: 95, revenue: 11455 },
    { id: 'ala15', name: 'ALA 15 (Gò Vấp) 301', type: 'vacant', guest: '', phone: '', checkIn: '', checkOut: '', pin: '381920', wifi: 'ALA_15 / pass1234', battery: 88, revenue: 6405 },
  ]);

  // Nhật ký hệ thống tự động (Log Automation)
  const [logs, setLogs] = useState([
    { time: '14:00:12', type: 'success', text: 'Hệ thống khởi động thành công. Kết nối Cloud Database ổn định.' },
    { time: '14:05:30', type: 'payment', text: 'Nhận Webhook VietQR: Khách chuyển 550.000đ khớp đơn ALA 12.' },
    { time: '14:05:31', type: 'lock', text: 'Đã gọi API TTLock: Sinh mã PIN [492018] cho phòng ALA 12.' },
    { time: '14:05:32', type: 'zalo', text: 'Đã gửi Zalo ZNS thành công cho SĐT 0901234567 (Mật khẩu cửa & Wifi).' },
    { time: '14:05:33', type: 'backup', text: 'Đã tự động tạo và gửi bản snapshot Excel (.xlsx) qua Gmail chủ nhà.' }
  ]);

  // Chế độ giả lập sập web (Failover Mode)
  const [isCrashMode, setIsCrashMode] = useState(false);

  // Cấu hình Backup
  const [adminEmail, setAdminEmail] = useState('admin.alahomestay@gmail.com');
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState('ala11');
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Thêm dòng Log tự động
  const addLog = (type, text) => {
    const timeNow = new Date().toLocaleTimeString();
    setLogs(prev => [{ time: timeNow, type, text }, ...prev]);
  };

  // Giả lập khách đặt phòng & Thanh toán tự động qua VietQR
  const handleClientBooking = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại!');
      return;
    }

    setPaymentSuccess(true);
    
    // Cập nhật trạng thái phòng sang Đang ở
    setRooms(prev => prev.map(r => {
      if (r.id === selectedRoomForBooking) {
        return {
          ...r,
          status: 'occupied',
          guest: clientName,
          phone: clientPhone,
          checkIn: new Date().toLocaleString(),
          checkOut: new Date(Date.now() + 86400000).toLocaleString(),
          revenue: r.revenue + 550000
        };
      }
      return r;
    }));

    // Bắn log tự động hóa
    addLog('payment', `Khách ${clientName} quét VietQR thanh toán thành công cho phòng ${selectedRoomForBooking.toUpperCase()}.`);
    addLog('lock', `Tự động tạo mã PIN SmartLock và đồng bộ hóa thời gian thuê.`);
    addLog('zalo', `Đã tự động gửi Zalo ZNS tin nhắn chứa mã PIN cửa và thông tin phòng.`);
    addLog('backup', `Hệ thống đã tự động backup file Excel và gửi về Gmail: ${adminEmail}.`);
  };

  // Đổi trạng thái phòng thủ công (Admin)
  const changeRoomStatus = (roomId, newStatus) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        let updated = { ...r, status: newStatus };
        if (newStatus === 'vacant') {
          updated.guest = '';
          updated.phone = '';
          updated.checkIn = '';
          updated.checkOut = '';
        }
        return updated;
      }
      return r;
    }));
    addLog('success', `Quản trị viên đã đổi trạng thái phòng ${roomId.toUpperCase()} thành [${newStatus.toUpperCase()}].`);
  };

  // Tải file Excel dự phòng thủ công (Failover Download)
  const downloadEmergencyExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Mã Phòng,Tên Phòng,Trạng Thái,Khách Hàng,SĐT,Mã PIN Cửa,Wifi,Doanh Thu\n"
      + rooms.map(r => `${r.id},${r.name},${r.status},${r.guest || 'Trống'},${r.phone || ''},${r.pin},"${r.wifi}",${r.revenue}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ALA_Homestay_Emergency_Backup_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('backup', 'Đã tải thành công file Excel dự phòng ngoại tuyến (Emergency Backup).');
  };

  const totalRevenue = rooms.reduce((acc, r) => acc + r.revenue, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* THANH THÔNG BÁO SỰ CỐ / FAILOVER BANNER KHI BẬT CHẾ ĐỘ SẬP WEB */}
      {isCrashMode && (
        <div className="bg-red-600 text-white px-4 py-3 flex flex-wrap items-center justify-between shadow-lg sticky top-0 z-50 animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <span className="font-bold">CHẾ ĐỘ SỰ CỐ KHẨN CẤP (FAILOVER MODE ACTIVE)</span>
            <span className="text-sm hidden md:inline">- Hệ thống Cloud đang bảo trì, kích hoạt vận hành thủ công bằng File Excel dự phòng.</span>
          </div>
          <button 
            onClick={downloadEmergencyExcel}
            className="bg-white text-red-700 px-4 py-1.5 rounded font-bold text-sm shadow hover:bg-red-50 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Tải File Excel Khẩn Cấp Ngay</span>
          </button>
        </div>
      )}

      {/* HEADER CHÍNH */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white font-bold text-xl">ALA</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ALA Homestay - Hệ Thống Quản Lý Tự Động</h1>
            <p className="text-xs text-slate-400">Gò Vấp, TP. Hồ Chí Minh (5 Phòng: ALA 11 đến ALA 15)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <button 
            onClick={() => setViewMode(viewMode === 'admin' ? 'client' : 'admin')}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>{viewMode === 'admin' ? '👉 Chuyển sang Trang Khách Đặt Phòng' : '👉 Quay lại Trang Quản Trị Admin'}</span>
          </button>

          <button 
            onClick={() => setIsCrashMode(!isCrashMode)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
              isCrashMode ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isCrashMode ? 'Đang bật Giả Lập Sập Web' : 'Thử nghiệm Sập Web (Crash Test)'}</span>
          </button>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="p-6 max-w-7xl mx-auto">

        {/* NẾU LÀ GIAO DIỆN CHỦ NHÀ (ADMIN) */}
        {viewMode === 'admin' ? (
          <div className="space-y-6">

            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Tổng doanh thu hệ thống</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{totalRevenue.toLocaleString()} VNĐ</h3>
                <span className="text-xs text-emerald-500 mt-2 inline-block">● Đồng bộ VietQR Real-time</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Số phòng đang hoạt động</p>
                <h3 className="text-2xl font-bold text-blue-400 mt-1">5 Phòng (ALA 11-15)</h3>
                <span className="text-xs text-blue-500 mt-2 inline-block">● Tự động hóa SmartLock</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <p className="text-slate-400 text-sm">Trạng thái Backup Gmail</p>
                <h3 className="text-xl font-bold text-purple-400 mt-1 truncate">{adminEmail}</h3>
                <span className="text-xs text-purple-400 mt-2 inline-block">● Đã bật tự động gửi file Excel</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tải File Excel Khẩn Cấp</p>
                  <p className="text-xs text-slate-500 mt-1">Dùng khi mất mạng hoặc sập cloud</p>
                </div>
                <button 
                  onClick={downloadEmergencyExcel}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Tải Excel Mới Nhất</span>
                </button>
              </div>
            </div>

            {/* SƠ ĐỒ 5 PHÒNG (ALA 11 ĐẾN ALA 15) */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Sơ Đồ Trạng Thái 5 Phòng & Khóa Thông Minh</span>
                </h2>
                <span className="text-xs text-slate-400">Click để đổi trạng thái hoặc xem mã PIN TTLock</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {rooms.map((room) => {
                  const isOccupied = room.status === 'occupied';
                  const isCleaning = room.status === 'cleaning';
                  return (
                    <div 
                      key={room.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between transition ${
                        isOccupied ? 'bg-amber-950/20 border-amber-600/50' : 
                        isCleaning ? 'bg-yellow-950/20 border-yellow-600/50' : 
                        'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-base text-slate-200">{room.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            isOccupied ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            isCleaning ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {isOccupied ? 'Đang ở' : isCleaning ? 'Dọn dẹp' : 'Trống'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300 my-3">
                          <p><strong>Khách:</strong> {room.guest || 'Chưa có'}</p>
                          <p><strong>SĐT:</strong> {room.phone || '---'}</p>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1 mt-2">
                            <p className="flex items-center justify-between text-blue-400 font-mono">
                              <span><Key className="w-3 h-3 inline mr-1"/> PIN: {room.pin}</span>
                              <span className="text-[10px] text-slate-400">Pin khóa: {room.battery}%</span>
                            </p>
                            <p className="text-[11px] text-slate-400 truncate"><Wifi className="w-3 h-3 inline mr-1"/> {room.wifi}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Doanh thu:</span>
                          <span className="text-emerald-400 font-bold">{room.revenue.toLocaleString()} đ</span>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => changeRoomStatus(room.id, 'vacant')}
                            className="flex-1 bg-slate-800 hover:bg-emerald-700 hover:text-white py-1 rounded text-[11px] transition"
                          >
                            Trống
                          </button>
                          <button 
                            onClick={() => changeRoomStatus(room.id, 'cleaning')}
                            className="flex-1 bg-slate-800 hover:bg-yellow-700 hover:text-white py-1 rounded text-[11px] transition"
                          >
                            Dọn
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NHẬT KÝ TỰ ĐỘNG HÓA & BACKUP GMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nhật ký hệ thống */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <h3 className="text-base font-bold mb-3 flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Nhật Ký Tự Động Hóa Real-Time (Webhook & ZNS)</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 font-mono text-xs">
                  {logs.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start space-x-2">
                      <span className="text-slate-500 whitespace-nowrap">[{log.time}]</span>
                      <span className={`flex-1 ${
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'payment' ? 'text-blue-400' :
                        log.type === 'lock' ? 'text-purple-400' :
                        log.type === 'zalo' ? 'text-amber-400' : 'text-slate-300'
                      }`}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cấu hình nhận file backup Excel qua Gmail */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold mb-3 flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    <span>Cấu Hình Tự Động Gửi File Excel & Backup</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Mỗi khi có khách đặt phòng thành công hoặc trả phòng, hệ thống tự động xuất file Excel cập nhật trạng thái mới nhất và gửi trực tiếp về Gmail của bạn.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Email nhận file backup:</label>
                      <input 
                        type="email" 
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-200"
                      />
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
                      <p>🟢 Trạng thái kết nối Gmail API: <strong>Đã kết nối an toàn</strong></p>
                      <p>🟢 Lịch trình Backup định kỳ: <strong>02:00 sáng hàng ngày + Theo sự kiện</strong></p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Đã lưu cấu hình email nhận file backup thành công tới: ${adminEmail}`)}
                  className="mt-4 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold transition w-full"
                >
                  Lưu Cấu Hình
                </button>
              </div>

            </div>

          </div>
        ) : (

          /* GIAO DIỆN KHÁCH TỰ ĐẶT PHÒNG (CLIENT SELF-BOOKING PORTAL) */
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Cổng Đặt Phòng Tự Động ALA Homestay</h2>
              <p className="text-sm text-slate-400 mt-1">Chọn phòng, quét VietQR và nhận mã PIN cửa tức thì!</p>
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-950/30 border border-emerald-600/50 p-6 rounded-xl text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-emerald-300">Thanh Toán Thành Công!</h3>
                <p className="text-sm text-slate-300">Hệ thống ngân hàng đã xác nhận giao dịch của bạn. Mã PIN khóa cửa đã được gửi qua tin nhắn Zalo.</p>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-sm">
                  <p><strong>Phòng đã chọn:</strong> {selectedRoomForBooking.toUpperCase()}</p>
                  <p><strong>Mã PIN vào phòng:</strong> <span className="text-emerald-400 font-mono font-bold text-lg">492018</span></p>
                  <p><strong>Mật khẩu Wifi:</strong> ALA_Wifi / pass1234</p>
                </div>
                <button 
                  onClick={() => setPaymentSuccess(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Đặt Thêm Phòng Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleClientBooking} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Chọn Phòng Muốn Thuê:</label>
                  <select 
                    value={selectedRoomForBooking}
                    onChange={(e) => setSelectedRoomForBooking(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} - Giá: 550.000đ/ngày</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Họ và tên của bạn:</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nguyễn Văn Nam"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Số điện thoại nhận mã PIN (Zalo/SMS):</label>
                  <input 
                    type="tel" 
                    placeholder="Ví dụ: 0901234567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                    required
                  />
                </div>

                {/* GIẢ LẬP VIETQR DỘNG */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-400">Quét mã QR để thanh toán tự động (550.000đ):</p>
                  <div className="bg-white p-3 inline-block rounded-lg shadow">
                    <img 
                      src={`https://img.vietqr.io/image/VCB-0123456789-compact2.png?amount=550000&addInfo=DATPHONG%20${selectedRoomForBooking.toUpperCase()}`} 
                      alt="VietQR Code" 
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>
                  <p className="text-[11px] text-amber-400">⚡ Nội dung chuyển khoản tự động: DATPHONG {selectedRoomForBooking.toUpperCase()}</p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Xác Nhận Đã Thanh Toán & Nhận Mã PIN</span>
                </button>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
  
}
