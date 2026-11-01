'use client';

import { useEffect, useState } from 'react';

export default function AdminStoreMenusPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8 text-white">
      {/* Header tiêu đề và nút thêm */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Quản Lý Menu Trang Bán Hàng</h1>
          <p className="text-xs sm:text-sm text-neutral-400">Tùy chỉnh tiêu đề, đường dẫn, sắp xếp thứ tự và phân cấp menu trên Navbar.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 text-center"
        >
          + Thêm Menu Mới
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-400">Đang tải danh sách menu...</div>
      ) : (
        <>
          {/* Giao diện Dạng Bảng (Chỉ hiện trên màn hình MD trở lên) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
                  <th className="p-3">Thứ tự</th>
                  <th className="p-3">Tên Menu</th>
                  <th className="p-3">Đường dẫn (Path)</th>
                  <th className="p-3">Phân cấp</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {menus.map((menu) => {
                  const isSub = menu.parent_id !== null;
                  const parentItem = menus.find(m => m.id === menu.parent_id);

                  return (
                    <tr key={menu.id} className="transition hover:bg-neutral-800/50">
                      <td className="p-3 font-mono font-bold text-amber-400">#{menu.sort_order}</td>
                      <td className="p-3 font-medium">
                        {isSub ? (
                          <span className="ml-4 flex items-center gap-1.5 text-neutral-300">
                            <span className="text-neutral-500">└─</span> {menu.title}
                          </span>
                        ) : (
                          <span className="font-bold text-white">{menu.title}</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-neutral-400">{menu.path}</td>
                      <td className="p-3">
                        {isSub ? (
                          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                            Con: {parentItem?.title || 'Gốc'}
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                            Menu Chính (Cấp 1)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {menu.is_active === 1 ? (
                          <span className="text-emerald-400 text-xs">● Hiển thị</span>
                        ) : (
                          <span className="text-neutral-500 text-xs">○ Đã ẩn</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(menu)}
                          className="rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="rounded bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20"
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

          {/* Giao diện Dạng Thẻ Card (Tối ưu riêng cho Mobile - Dưới màn hình MD) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {menus.map((menu) => {
              const isSub = menu.parent_id !== null;
              const parentItem = menus.find(m => m.id === menu.parent_id);

              return (
                <div 
                  key={menu.id} 
                  className={`rounded-xl border bg-neutral-900 p-4 shadow-md ${
                    isSub ? 'border-neutral-800 ml-4 border-l-4 border-l-blue-500' : 'border-neutral-700 border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-400">
                          #{menu.sort_order}
                        </span>
                        <h3 className="font-bold text-white text-base">
                          {isSub ? `└─ ${menu.title}` : menu.title}
                        </h3>
                      </div>
                      <p className="mt-1 font-mono text-xs text-neutral-400 break-all">{menu.path}</p>
                    </div>

                    <div>
                      {menu.is_active === 1 ? (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">Hiển thị</span>
                      ) : (
                        <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 font-medium">Ẩn</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3 text-xs">
                    <div>
                      {isSub ? (
                        <span className="text-blue-400 font-medium">Thuộc: {parentItem?.title || 'Gốc'}</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">Menu Chính (Cấp 1)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(menu)}
                        className="rounded bg-neutral-800 px-3 py-1.5 font-medium text-neutral-200 hover:bg-neutral-700"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="rounded bg-red-500/10 px-3 py-1.5 font-medium text-red-400 hover:bg-red-500/20"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal Thêm / Sửa Menu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold">
              {editingMenu ? 'Chỉnh Sửa Menu' : 'Thêm Menu Mới'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Tên Menu</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ví dụ: Thời Trang Nam"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Đường dẫn (Path)</label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ví dụ: /search/tt-nam"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">Menu Cha (Phân cấp)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Là menu gốc (Cấp 1) --</option>
                  {parentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">Thứ tự (`sort_order`)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">Trạng thái</label>
                  <select
                    value={isActive}
                    onChange={(e) => setIsActive(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value={1}>Hiển thị</option>
                    <option value={0}>Ẩn</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                >
                  Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}