import React, { useState } from 'react';

export default function HomestayApp() {
  const [viewMode, setViewMode] = useState('admin');
  const [rooms, setRooms] = useState([
    { id: 'ala11', name: 'ALA 11 (Gò Vấp) 101', status: 'vacant', guest: '', phone: '', pin: '829102', wifi: 'ALA_11 / pass1234', battery: 92, revenue: 10151 },
    { id: 'ala12', name: 'ALA 12 (Gò Vấp) 302', status: 'occupied', guest: 'Nguyễn Văn A', phone: '0901234567', pin: '492018', wifi: 'ALA_12 / pass1234', battery: 85, revenue: 11839 },
    { id: 'ala13', name: 'ALA 13 (Gò Vấp) 201', status: 'vacant', guest: '', phone: '', pin: '519203', wifi: 'ALA_13 / pass1234', battery: 78, revenue: 8423 },
    { id: 'ala14', name: 'ALA 14 (Gò Vấp) 202', status: 'cleaning', guest: '', phone: '', pin: '730192', wifi: 'ALA_14 / pass1234', battery: 95, revenue: 11455 },
    { id: 'ala15', name: 'ALA 15 (Gò Vấp) 301', status: 'vacant', guest: '', phone: '', pin: '381920', wifi: 'ALA_15 / pass1234', battery: 88, revenue: 6405 },
  ]);

  const totalRevenue = rooms.reduce((acc, r) => acc + r.revenue, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">ALA Homestay - Quản Lý Tự Động</h1>
          <p className="text-sm text-slate-400">Hệ thống quản lý 5 phòng (ALA 11 đến ALA 15) - Gò Vấp</p>
        </div>
        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block">Tổng doanh thu:</span>
          <span className="text-lg font-bold text-emerald-400">{totalRevenue.toLocaleString()} VNĐ</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">{room.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  room.status === 'occupied' ? 'bg-amber-500/20 text-amber-400' :
                  room.status === 'cleaning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {room.status === 'occupied' ? 'Đang ở' : room.status === 'cleaning' ? 'Dọn dẹp' : 'Trống'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2"><strong>Khách:</strong> {room.guest || 'Chưa có'}</p>
              <p className="text-xs text-slate-300"><strong>Mã PIN:</strong> <span className="text-blue-400 font-mono">{room.pin}</span></p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-bold text-right">
              {room.revenue.toLocaleString()} đ
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
