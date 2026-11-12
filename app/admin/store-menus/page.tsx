'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminStoreMenusPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Phân trang state (giảm pageSize xuống 8 hoặc 10 để vừa khít màn hình không cần cuộn)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Form state
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [parentId, setParentId] = useState<any>('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(1);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/store-menus');
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setTitle('');
    setPath('/search/');
    setParentId('');
    setSortOrder(0);
    setIsActive(1);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: any) => {
    setEditingMenu(menu);
    setTitle(menu.title);
    setPath(menu.path);
    setParentId(menu.parent_id || '');
    setSortOrder(menu.sort_order || 0);
    setIsActive(menu.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingMenu ? editingMenu.id : undefined,
      title,
      path,
      parent_id: parentId === '' ? null : Number(parentId),
      sort_order: Number(sortOrder),
      is_active: Number(isActive),
    };

    const url = '/api/admin/store-menus';
    const method = editingMenu ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setIsModalOpen(false);
      fetchMenus();
    } else {
      alert(data.error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa menu này? (Các sub-menu con bên trong cũng sẽ bị xóa)')) return;

    const res = await fetch(`/api/admin/store-menus?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchMenus();
    } else {
      alert(data.error || 'Không thể xóa menu');
    }
  };

  const parentOptions = menus.filter(m => m.parent_id === null && (!editingMenu || m.id !== editingMenu.id));

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(menus.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentMenus = menus.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-5">
        {/* Header tiêu đề và các nút chức năng */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Quản Lý Menu Trang Bán Hàng</h1>
            <p className="text-[11px] sm:text-xs text-neutral-400">Tùy chỉnh tiêu đề, đường dẫn, sắp xếp thứ tự và phân cấp menu trên Navbar.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/admin/music"
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-500 text-center shadow flex items-center justify-center gap-1"
            >
              🎵 Nghe Nhạc
            </Link>

            <button
              onClick={handleOpenAddModal}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-400 text-center shadow"
            >
              + Thêm Menu Mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-neutral-400 text-xs">Đang tải danh sách menu...</div>
        ) : menus.length === 0 ? (
          <div className="py-8 text-center text-neutral-400 text-xs border border-neutral-800 rounded-xl">Chưa có menu nào trong cơ sở dữ liệu.</div>
        ) : (
          <>
            {/* Giao diện Dạng Bảng (Thu gọn font và padding để vừa khít màn hình) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
                    <th className="py-2.5 px-3">Thứ tự</th>
                    <th className="py-2.5 px-3">Tên Menu</th>
                    <th className="py-2.5 px-3">Đường dẫn (Path)</th>
                    <th className="py-2.5 px-3">Phân cấp</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {currentMenus.map((menu) => {
                    const isSub = menu.parent_id !== null;
                    const parentItem = menus.find(m => m.id === menu.parent_id);

                    return (
                      <tr key={menu.id} className="transition hover:bg-neutral-800/50">
                        <td className="py-2 px-3 font-mono font-bold text-amber-400">#{menu.sort_order}</td>
                        <td className="py-2 px-3 font-medium">
                          {isSub ? (
                            <span className="ml-3 flex items-center gap-1 text-neutral-300">
                              <span className="text-neutral-500">└─</span> {menu.title}
                            </span>
                          ) : (
                            <span className="font-bold text-white">{menu.title}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">{menu.path}</td>
                        <td className="py-2 px-3">
                          {isSub ? (
                            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">
                              Con: {parentItem?.title || 'Gốc'}
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                              Chính (Cấp 1)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {menu.is_active === 1 ? (
                            <span className="text-emerald-400 text-[11px]">● Hiển thị</span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">○ Đã ẩn</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(menu)}
                            className="rounded bg-blue-600/20 px-2.5 py-1 text-[11px] font-semibold text-blue-400 transition hover:bg-blue-600/30"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="rounded bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/30"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Giao diện Dạng Thẻ Card Mobile (Thu gọn) */}
            <div className="grid grid-cols-1 gap-2.5 md:hidden">
              {currentMenus.map((menu) => {
                const isSub = menu.parent_id !== null;
                const parentItem = menus.find(m => m.id === menu.parent_id);

                return (
                  <div 
                    key={menu.id} 
                    className={`rounded-lg border bg-neutral-900 p-3 shadow ${
                      isSub ? 'border-neutral-800 ml-3 border-l-4 border-l-blue-500' : 'border-neutral-700 border-l-4 border-l-amber-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                            #{menu.sort_order}
                          </span>
                          <h3 className="font-bold text-white text-xs">
                            {isSub ? `└─ ${menu.title}` : menu.title}
                          </h3>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-neutral-400 break-all">{menu.path}</p>
                      </div>

                      <div>
                        {menu.is_active === 1 ? (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400 font-medium">Hiển thị</span>
                        ) : (
                          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-400 font-medium">Ẩn</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-neutral-800 pt-2 text-[11px]">
                      <div>
                        {isSub ? (
                          <span className="text-blue-400">Thuộc: {parentItem?.title || 'Gốc'}</span>
                        ) : (
                          <span className="text-emerald-400">Cấp 1</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(menu)}
                          className="rounded bg-blue-600/20 px-2.5 py-1 font-semibold text-blue-400 text-[10px] transition hover:bg-blue-600/30"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="rounded bg-red-500/20 px-2.5 py-1 font-semibold text-red-400 text-[10px] transition hover:bg-red-500/30"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* THANH PHÂN TRANG (Gọn gàng ngay trong màn hình) */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1.5 border-t border-neutral-800 pt-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-700 disabled:opacity-40"
                >
                  ← Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-7 w-7 rounded text-xs font-bold transition ${
                        p === currentPage
                          ? 'bg-amber-500 text-black'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-700 disabled:opacity-40"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal Thêm / Sửa Menu */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl max-h-[90vh] overflow-y-auto text-white">
              <h3 className="mb-4 text-sm font-bold">
                {editingMenu ? 'Chỉnh Sửa Menu' : 'Thêm Menu Mới'}
              </h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-neutral-300">Tên Menu</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Ví dụ: Thời Trang Nam"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-neutral-300">Đường dẫn (Path)</label>
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    required
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Ví dụ: /search/tt-nam"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-neutral-300">Menu Cha (Phân cấp)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Là menu gốc (Cấp 1) --</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-neutral-300">Thứ tự (`sort_order`)</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-neutral-300">Trạng thái</label>
                    <select
                      value={isActive}
                      onChange={(e) => setIsActive(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value={1}>Hiển thị</option>
                      <option value={0}>Ẩn</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                  >
                    Lưu Lại
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}