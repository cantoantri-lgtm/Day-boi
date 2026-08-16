import React from "react";
import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    FullName: '',
    phone: '',
    password: '',
    Role: 'Student',
    Status: 'Active'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchApi('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      FullName: '',
      phone: '',
      password: '',
      Role: 'Student',
      Status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.UserID);
    setFormData({
      FullName: user.FullName || '',
      phone: user.PhoneNumber || '',
      password: '',
      Role: user.Role || 'Student',
      Status: user.Status || 'Active'
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?')) return;
    try {
      await fetchApi(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Inactive' })
      });
      loadUsers();
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật.');
    }
  };

  const handleRealDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteError("");
    setSaving(true);
    try {
      await fetchApi(`/users/${deleteConfirmId}`, {
        method: 'DELETE'
      });
      setDeleteConfirmId(null);
      loadUsers();
    } catch (err: any) {
      setDeleteError(err.message || 'Có lỗi xảy ra khi xóa');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const payload: any = { 
          role: formData.Role, 
          status: formData.Status,
          fullName: formData.FullName
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await fetchApi(`/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        const payload = {
          fullName: formData.FullName,
          phone: formData.phone,
          password: formData.password,
          role: formData.Role,
          status: formData.Status
        };
        await fetchApi('/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      loadUsers();
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
        <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-sky-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-sky-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.UserID} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{user.FullName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Ngày tạo: {new Date(user.CreatedAt).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{user.PhoneNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.Role || 'Student').split(',').map((r: string) => r.trim()).map((role: string) => (
                        <span key={role} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          role === 'Teacher' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {role === 'Admin' ? 'Quản trị' : role === 'Teacher' ? 'Giáo viên' : 'Học viên'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${user.Status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.Status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className="text-xs bg-sky-50 text-sky-600 px-3 py-1.5 rounded font-bold hover:bg-sky-100 transition-colors"
                    >
                      Sửa
                    </button>
                    {user.Status === 'Active' && (
                      <button 
                        onClick={() => handleDelete(user.UserID)}
                        className="text-xs bg-slate-50 text-slate-500 px-3 py-1.5 rounded font-bold hover:bg-slate-100 transition-colors"
                      >
                        Khóa
                      </button>
                    )}
                    <button 
                      onClick={() => setDeleteConfirmId(user.UserID)}
                      className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded font-bold hover:bg-red-100 transition-colors"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
                <input
                  required
                  type="text"
                  value={formData.FullName}
                  onChange={e => setFormData({...formData, FullName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  required={!editingId}
                  disabled={!!editingId}
                  type="text"
                  pattern="[0-9]*"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="VD: 0912345678"
                />
                {editingId && <p className="text-[11px] text-slate-400 mt-1">Không thể thay đổi số điện thoại sau khi tạo.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mật khẩu (6 chữ số)</label>
                <input
                  required={!editingId}
                  type="password"
                  pattern="\d{6}"
                  maxLength={6}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  placeholder={editingId ? "Bỏ trống nếu không muốn đổi" : "Nhập 6 chữ số"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Vai trò</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: 'Student', label: 'Học viên' },
                      { value: 'Teacher', label: 'Giáo viên' },
                      { value: 'Admin', label: 'Quản trị' }
                    ].map(opt => {
                      const isSelected = formData.Role.includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => {
                              let currentRoles = formData.Role ? formData.Role.split(',').map(r => r.trim()).filter(Boolean) : [];
                              if (e.target.checked) {
                                if (!currentRoles.includes(opt.value)) currentRoles.push(opt.value);
                              } else {
                                currentRoles = currentRoles.filter(r => r !== opt.value);
                              }
                              setFormData({...formData, Role: currentRoles.join(', ')});
                            }}
                            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.Status}
                    onChange={e => setFormData({...formData, Status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Khóa</option>
                  </select>
                </div>
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
                Xác nhận xóa người dùng
              </h2>
              <button onClick={() => { setDeleteConfirmId(null); setDeleteError(""); }} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium">
                Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này không? Hành động này không thể hoàn tác.
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
                onClick={handleRealDelete}
                disabled={saving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
