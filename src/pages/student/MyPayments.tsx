import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';
import { DollarSign } from 'lucide-react';

export default function MyPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/payments').then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Lịch sử học phí</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-50 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-sky-50">
              <tr>
                <th className="px-6 py-3">Mã giao dịch</th>
                <th className="px-6 py-3">Ngày thanh toán</th>
                <th className="px-6 py-3">Số tiền</th>
                <th className="px-6 py-3">Phương thức</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {payments.map(payment => (
                <tr key={payment.PaymentID}>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{payment.PaymentID.slice(0,8)}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(payment.PaymentDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(payment.Amount))}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{payment.PaymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${payment.PaymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {payment.PaymentStatus === 'Paid' ? 'Đã đóng' : 'Chưa đủ'}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Chưa có lịch sử thanh toán nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
