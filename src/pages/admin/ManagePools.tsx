import React from "react";
import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

const parseTime = (timeStr: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('1899') || timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      }
    } catch (e) {
      return timeStr;
    }
  }
  return timeStr;
};

export default function ManagePools() {
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    PoolName: '',
    Address: '',
    Capacity: '',
    OpenTime: '06:00',
    CloseTime: '20:00',
    PricePerSession: '',
    Status: 'Active',
    Notes: ''
  });

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const data = await fetchApi('/pools');
      setPools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      PoolName: '',
      Address: '',
      Capacity: '',
      OpenTime: '06:00',
      CloseTime: '20:00',
      PricePerSession: '',
      Status: 'Active',
      Notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pool: any) => {
    setEditingId(pool.PoolID);
    setFormData({
      PoolName: pool.PoolName || '',
      Address: pool.Address || '',
      Capacity: pool.Capacity || '',
      OpenTime: parseTime(pool.OpenTime) || '06:00',
      CloseTime: parseTime(pool.CloseTime) || '20:00',
      PricePerSession: pool.PricePerSession || '',
      Status: pool.Status || 'Active',
      Notes: pool.Notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (poolId: string) => {
    if (!confirm('Bạn có chắc chắn muốn chuyển hồ bơi này sang trạng thái Tạm dừng?')) return;
    try {
      await fetchApi(`/pools/${poolId}`, {
        method: 'PUT',
        body: JSON.stringify({ Status: 'Inactive' })
      });
      loadPools();
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await fetchApi(`/pools/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/pools', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      loadPools();
    } catch (err: any) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-sky-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý hồ bơi</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-sky-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-sky-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm hồ bơi
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-50 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-sky-50">
              <tr>
                <th className="px-6 py-3">Hồ bơi</th>
                <th className="px-6 py-3">Giờ hoạt động</th>
                <th className="px-6 py-3">Sức chứa</th>
                <th className="px-6 py-3">Đơn giá/buổi</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {pools.map(pool => (
                <tr key={pool.PoolID} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{pool.PoolName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{pool.Address}</div>
                    {pool.Notes && <div className="text-[11px] text-slate-400 mt-1 italic">{pool.Notes}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{parseTime(pool.OpenTime)} - {parseTime(pool.CloseTime)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{pool.Capacity} người/ca</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(pool.PricePerSession || '0'))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pool.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {pool.Status === 'Active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(pool)}
                      className="text-xs bg-sky-50 text-sky-600 px-3 py-1.5 rounded font-bold hover:bg-sky-100 transition-colors"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(pool.PoolID)}
                      className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded font-bold hover:bg-red-100 transition-colors"
                    >
                      Tạm dừng
                    </button>
                  </td>
                </tr>
              ))}
              {pools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                    Chưa có hồ bơi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Sửa thông tin hồ bơi' : 'Thêm hồ bơi mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên hồ bơi</label>
                <input
                  required
                  type="text"
                  value={formData.PoolName}
                  onChange={e => setFormData({...formData, PoolName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  placeholder="VD: Hồ Bơi Yết Kiêu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Địa chỉ</label>
                <input
                  required
                  type="text"
                  value={formData.Address}
                  onChange={e => setFormData({...formData, Address: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  placeholder="VD: Số 1 Nguyễn Thị Minh Khai"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sức chứa (người/ca)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.Capacity}
                    onChange={e => setFormData({...formData, Capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Đơn giá/buổi (VNĐ)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.PricePerSession}
                    onChange={e => setFormData({...formData, PricePerSession: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Giờ mở cửa</label>
                  <input
                    required
                    type="time"
                    value={formData.OpenTime}
                    onChange={e => setFormData({...formData, OpenTime: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Giờ đóng cửa</label>
                  <input
                    required
                    type="time"
                    value={formData.CloseTime}
                    onChange={e => setFormData({...formData, CloseTime: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.Status}
                    onChange={e => setFormData({...formData, Status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Tạm dừng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ghi chú (Không bắt buộc)</label>
                <textarea
                  value={formData.Notes}
                  onChange={e => setFormData({...formData, Notes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  rows={2}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-sky-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
              <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Tạm dừng hồ bơi
              </h2>
              <button onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium">
                Bạn có chắc chắn muốn chuyển hồ bơi này sang trạng thái Tạm dừng không?
              </p>
              {deleteError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                  {deleteError}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

