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
    
    const encodedUri =
