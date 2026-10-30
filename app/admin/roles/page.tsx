'use client';

import { useEffect, useState } from 'react';

// Cấu hình cache 30 phút để triệt tiêu hoàn toàn tình trạng ngốn quota Rows Read trên Turso DB
let rolesCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 phút

interface Menu {
  code: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  role_id: string;
  menu_code: string;
}

interface AdminUser {
  admin_id: string;
  customer_id: string;
  role_id: string;
  role_name: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  assigned_at: string;
}

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<'admins' | 'permissions'>('admins');
  const [loading, setLoading] = useState(true);

  const [availableMenus, setAvailableMenus] = useState<Menu[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [activeRoleConfig, setActiveRoleConfig] = useState<string>('admin');
  const [rolePermissionsState, setRolePermissionsState] = useState<string[]>([]);

  const fetchData = async (forceRefresh = false) => {
    const now = Date.now();
    // Dùng cache trong vòng 30 phút để tiết kiệm tối đa lượt đọc database
    if (!forceRefresh && rolesCache && now - rolesCache.timestamp < CACHE_TTL) {
      const data = rolesCache.data;
      setAvailableMenus(data.availableMenus || []);
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);
      setAdminUsers(data.adminUsers || []);
      if (data.roles?.length > 0 && !selectedRole) {
        setSelectedRole(data.roles[0].id);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        
        // Lưu cache 30 phút
        rolesCache = { data, timestamp: Date.now() };

        setAvailableMenus(data.availableMenus || []);
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);
        setAdminUsers(data.adminUsers || []);

        if (data.roles?.length > 0 && !selectedRole) {
          setSelectedRole(data.roles[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const currentRolePerms = permissions
      .filter((p) => p.role_id === activeRoleConfig)
      .map((p) => p.menu_code);
    setRolePermissionsState(currentRolePerms);
  }, [activeRoleConfig, permissions]);

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      alert('Vui lòng nhập Số điện thoại hoặc Email tài khoản!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword.trim(), role_id: selectedRole }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setSearchKeyword('');
        rolesCache = null; // Xóa cache ngay khi có thao tác thêm mới
        fetchData(true);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAdmin = async (customerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn tước quyền Admin của người dùng này?')) return;

    try {
      const res = await fetch(`/api/admin/roles?customer_id=${customerId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Đã tước quyền Admin!');
        rolesCache = null; // Xóa cache ngay khi tước quyền
        fetchData(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMenuPermission = (menuCode: string) => {
    setRolePermissionsState((prev) =>
      prev.includes(menuCode) ? prev.filter((code) => code !== menuCode) : [...prev, menuCode]
    );
  };

  const handleSavePermissions = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: activeRoleConfig, menu_codes: rolePermissionsState }),
      });

      if (res.ok) {
        alert('Cập nhật menu được phép cho Vai trò thành công!');
        rolesCache = null;
        fetchData(true);
      } else {
        alert('Lưu thất bại!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">🔐 Phân quyền & Quản trị viên</h1>
            <p className="text-xs sm:text-sm text-neutral-400">Dò tìm tài khoản khách hàng để cấp quyền quản trị</p>
          </div>
          <button 
            type="button" 
            onClick={() => { rolesCache = null; fetchData(true); }}
            className="rounded bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'admins' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            👥 Quản trị viên ({adminUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'permissions' ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            ⚙️ Cấu hình Vai trò & Menu
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Đang tải dữ liệu...</div>
        ) : activeTab === 'admins' ? (
          <div className="space-y-6">
            <form onSubmit={handleAssignAdmin} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
              <h2 className="text-sm font-bold text-amber-400">🔍 Dò tìm tài khoản & Cấp quyền Admin</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-neutral-400">Nhập Số điện thoại hoặc Email đã đăng ký</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0987654321 hoặc user@gmail.com"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Gán vai trò (Role)</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'Đang kiểm tra...' : '🔍 Kiểm tra & Cấp quyền'}
                </button>
              </div>
            </form>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Danh sách Quản trị viên hiện tại
              </h3>

              {adminUsers.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">Chưa có quản trị viên nào trong hệ thống.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-300">
                    <thead className="border-b border-neutral-800 bg-neutral-950/50 uppercase text-neutral-400">
                      <tr>
                        <th className="p-3">Họ tên</th>
                        <th className="p-3">Số điện thoại / Email</th>
                        <th className="p-3">Vai trò</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {adminUsers.map((au) => (
                        <tr key={au.admin_id} className="hover:bg-neutral-800/40">
                          <td className="p-3 font-semibold text-white">{au.name || 'N/A'}</td>
                          <td className="p-3">
                            <p className="font-mono text-amber-400">{au.phone || 'Chưa có SĐT'}</p>
                            <p className="text-[10px] text-neutral-500">{au.email || 'Chưa có Email'}</p>
                          </td>
                          <td className="p-3">
                            <span className="rounded bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-400 border border-amber-500/20">
                              {au.role_name || au.role_id}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokeAdmin(au.customer_id)}
                              className="rounded bg-red-500/10 px-2.5 py-1 font-semibold text-red-400 hover:bg-red-500/20"
                            >
                              Tước quyền Admin
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
              <h3 className="mb-2 text-xs font-bold text-amber-400">1. Chọn Vai trò</h3>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRoleConfig(r.id)}
                  className={`w-full text-left rounded-lg p-2.5 transition text-xs ${
                    activeRoleConfig === r.id
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <p className="text-sm">{r.name}</p>
                  <p className="text-[11px] text-neutral-400 font-normal">{r.description}</p>
                </button>
              ))}
            </div>
            <div className="md:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-amber-400">
                  2. Menu được phép truy cập [{roles.find((r) => r.id === activeRoleConfig)?.name}]
                </h3>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={submitting}
                  className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu quyền hạn'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableMenus.map((menu) => {
                  const isChecked = rolePermissionsState.includes(menu.code);
                  return (
                    <label
                      key={menu.code}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition text-xs ${
                        isChecked
                          ? 'border-amber-500/50 bg-amber-500/10 text-white'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleMenuPermission(menu.code)}
                        className="h-4 w-4 accent-amber-500 rounded"
                      />
                      <div>
                        <p className="font-semibold">{menu.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">code: {menu.code}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}