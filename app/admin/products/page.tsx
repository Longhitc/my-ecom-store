'use client';

import ProductStatusToggle from 'components/admin/ProductStatusToggle';
import { useEffect, useState } from 'react';

// Cấu trúc Menu chuẩn của hệ thống
const MENU_DATA = [
  { title: 'Trang Chủ', path: '/search' },
  { title: 'Thời Trang Nam', path: '/search/tt-nam' },
  {
    title: 'Thời Trang Nữ',
    path: '/search/tt-nu',
    items: [
      { title: 'Váy Nữ', path: '/search/vay-nu' },
      { title: 'Áo Nữ', path: '/search/ao-nu' },
      { title: 'Set & Bộ', path: '/search/set-bo' },
    ],
  },
  { title: 'Thời Trang Trẻ Em', path: '/search/tt-te' },
  {
    title: 'Giày dép Crocs',
    path: '/search/gd-crocs',
    items: [
      { title: 'Crocs Nam', path: '/search/crocs-nam' },
      { title: 'Crocs Nữ', path: '/search/crocs-nu' },
      { title: 'Crocs Trẻ Em', path: '/search/crocs-tre-em' },
      { title: 'Crocs Unisex', path: '/search/crocs-unisex' },
    ],
  },
  { title: 'Phụ Kiện', path: '/search/pk' },
];

interface CategoryOption {
  title: string;
  slug: string;
}

const getCategoryOptions = (): CategoryOption[] => {
  const options: CategoryOption[] = [];
  
  MENU_DATA.forEach((item) => {
    const slug = item.path.replace('/search/', '').replace('/search', '');
    if (slug) {
      options.push({ title: item.title, slug });
    }
    if (item.items) {
      item.items.forEach((sub) => {
        const subSlug = sub.path.replace('/search/', '').replace('/search', '');
        if (subSlug) {
          options.push({ title: `${item.title} > ${sub.title}`, slug: subSlug });
        }
      });
    }
  });

  return options;
};

const CATEGORY_OPTIONS = getCategoryOptions();

const normalizeCategorySlug = (rawCategory?: string): string => {
  if (!rawCategory) return CATEGORY_OPTIONS[0]?.slug || 'tt-nam';
  
  const cleanRaw = rawCategory.trim().toLowerCase();
  
  const matchBySlug = CATEGORY_OPTIONS.find((c) => c.slug.toLowerCase() === cleanRaw);
  if (matchBySlug) return matchBySlug.slug;

  const matchByTitle = CATEGORY_OPTIONS.find(
    (c) => c.title.toLowerCase() === cleanRaw || c.title.toLowerCase().endsWith(cleanRaw)
  );
  if (matchByTitle) return matchByTitle.slug;

  return CATEGORY_OPTIONS[0]?.slug || 'tt-nam';
};

interface VariantAttribute {
  name: string;
  value: string;
}

interface Variant {
  id?: string;
  title: string;
  amount: number;
  quantity_available: number;
  attributes: VariantAttribute[];
}

interface Product {
  id: string;
  handle?: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
  is_active?: boolean;
  image_url?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  images?: string[];
  variants?: Variant[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    handle: '',
    category: CATEGORY_OPTIONS[0]?.slug || 'tt-nam',
    featured_image_url: '',
    featured_image_alt: '',
    description: '',
    images: [''],
    variants: [
      {
        title: 'Mặc định',
        amount: 285000,
        quantity_available: 10,
        attributes: [
          { name: 'Màu sắc', value: 'Đen' },
          { name: 'Size', value: 'M4' },
        ],
      },
    ],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        alert('Không thể tải danh sách sản phẩm!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi kết nối!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      handle: slugify(val),
    }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      handle: '',
      category: CATEGORY_OPTIONS[0]?.slug || 'tt-nam',
      featured_image_url: '',
      featured_image_alt: '',
      description: '',
      images: [''],
      variants: [
        {
          title: 'Mặc định',
          amount: 200000,
          quantity_available: 10,
          attributes: [
            { name: 'Màu sắc', value: 'Đen' },
            { name: 'Size', value: 'M4' },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);

    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.product) {
          const p = data.product;

          const loadedImages =
            Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : [''];

          const loadedVariants =
            Array.isArray(p.variants) && p.variants.length > 0
              ? p.variants
              : [
                  {
                    title: 'Mặc định',
                    amount: product.price || 0,
                    quantity_available: product.stock || 0,
                    attributes: [],
                  },
                ];

          const matchedCategorySlug = normalizeCategorySlug(p.category || product.category);

          setFormData({
            title: p.title || '',
            handle: p.handle || '',
            category: matchedCategorySlug,
            featured_image_url: p.featured_image_url || p.image_url || '',
            featured_image_alt: p.featured_image_alt || '',
            description: p.description || '',
            images: loadedImages,
            variants: loadedVariants,
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
        alert('Đã xóa sản phẩm thành công!');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Xóa sản phẩm thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi xóa!');
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          title: `Biến thể ${formData.variants.length + 1}`,
          amount: 0,
          quantity_available: 0,
          attributes: [{ name: 'Size', value: '' }],
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const updateVariant = (index: number, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [key]: value } : v
      ),
    }));
  };

  const addAttribute = (vIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === vIndex
          ? {
              ...v,
              attributes: [...(v.attributes || []), { name: '', value: '' }],
            }
          : v
      ),
    }));
  };

  const updateAttribute = (
    vIndex: number,
    aIndex: number,
    key: 'name' | 'value',
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== vIndex) return v;
        const updatedAttrs = (v.attributes || []).map((attr, j) =>
          j === aIndex ? { ...attr, [key]: val } : attr
        );
        return { ...v, attributes: updatedAttrs };
      }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const isEdit = Boolean(editingProduct);
      const url = '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit ? { id: editingProduct?.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lưu sản phẩm thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).toLowerCase().includes(searchTerm.toLowerCase());

    const productNormalizedCategory = normalizeCategorySlug(p.category);
    const matchesCategory = categoryFilter === 'ALL' || productNormalizedCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-950 p-3 sm:p-6 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header Tối Ưu Mobile */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">🛍️ Quản lý sản phẩm</h1>
            <p className="text-xs sm:text-sm text-neutral-400">Thêm, sửa, xóa và quản lý kho hàng</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="flex-1 sm:flex-none rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 active:scale-95"
            >
              🔄 Tải lại
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 active:scale-95"
            >
              ➕ Thêm mới
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:gap-4">
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, mã ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">Tất cả danh mục</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title} ({cat.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách Sản Phẩm */}
        {loading ? (
          <div className="py-20 text-center text-sm text-neutral-400">Đang tải danh sách sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            Không tìm thấy sản phẩm nào!
          </div>
        ) : (
          <>
            {/* 1. GIAO DIỆN MOBILE: DẠNG THẺ (CARDS) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredProducts.map((product) => {
                const displayImage = product.featured_image_url || product.image_url;
                const categorySlug = normalizeCategorySlug(product.category);
                const categoryObj = CATEGORY_OPTIONS.find((c) => c.slug === categorySlug);
                const displayCategoryName = categoryObj ? categoryObj.title : product.category || 'Chưa phân loại';
                const activeStatus = product.is_active === true || (product.is_active as any) === 1;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 shadow-md"
                  >
                    {/* Hàng 1: Ảnh, Tên, ID, Danh mục */}
                    <div className="flex gap-3">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={product.title}
                          className="h-16 w-16 shrink-0 rounded-lg border border-neutral-800 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-[10px] text-neutral-500">
                          No img
                        </div>
                      )}
                      <div className="flex flex-1 flex-col justify-between overflow-hidden">
                        <div>
                          <p className="line-clamp-2 text-sm font-semibold text-white">{product.title}</p>
                          <p className="font-mono text-[11px] text-neutral-500">#{product.id}</p>
                        </div>
                        <span className="inline-block w-fit rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
                          {displayCategoryName}
                        </span>
                      </div>
                    </div>

                    {/* Hàng 2: Giá & Tồn Kho */}
                    <div className="flex items-center justify-between border-t border-neutral-800/60 pt-2 text-xs">
                      <div>
                        <span className="text-neutral-400">Giá: </span>
                        <span className="font-bold text-amber-400">
                          {product.price ? product.price.toLocaleString('vi-VN') : 0} đ
                        </span>
                      </div>
                      <div>
                        <span
                          className={`font-medium ${
                            (product.stock ?? 0) > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {(product.stock ?? 0) > 0 ? `Còn (${product.stock})` : 'Hết hàng'}
                        </span>
                      </div>
                    </div>

                    {/* Hàng 3: Trạng thái Hiện/Ẩn & Các Nút Thao tác */}
                    <div className="flex items-center justify-between border-t border-neutral-800/60 pt-2">
                      <div className="flex items-center gap-1.5">
                        <ProductStatusToggle productId={product.id} initialStatus={activeStatus} />
                        <span className={`text-xs font-medium ${activeStatus ? 'text-green-400' : 'text-neutral-500'}`}>
                          {activeStatus ? 'Hiện' : 'Ẩn'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="rounded bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 active:bg-blue-500/30"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 active:bg-red-500/30"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. GIAO DIỆN DESKTOP: BẢNG BÌNH THƯỜNG (DESKTOP ONLY) */}
            <div className="hidden overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 md:block">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="border-b border-neutral-800 bg-neutral-950/50 text-xs uppercase text-neutral-400">
                  <tr>
                    <th className="p-4">Thao tác</th>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Giá bán</th>
                    <th className="p-4">Tồn kho</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Xóa bỏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredProducts.map((product) => {
                    const displayImage = product.featured_image_url || product.image_url;
                    const categorySlug = normalizeCategorySlug(product.category);
                    const categoryObj = CATEGORY_OPTIONS.find((c) => c.slug === categorySlug);
                    const displayCategoryName = categoryObj ? categoryObj.title : product.category || 'Chưa phân loại';
                    const activeStatus = product.is_active === true || (product.is_active as any) === 1;

                    return (
                      <tr key={product.id} className="transition hover:bg-neutral-800/50">
                        <td className="p-4">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="rounded bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/20"
                          >
                            Sửa Chi Tiết
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={product.title}
                                className="h-12 w-12 rounded-lg border border-neutral-800 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-xs text-neutral-500">
                                No img
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{product.title}</p>
                              <p className="font-mono text-xs text-neutral-500">#{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-medium text-neutral-400">
                          <span className="rounded bg-neutral-800 px-2 py-1">
                            {displayCategoryName}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-400">
                          {product.price ? product.price.toLocaleString('vi-VN') : 0} đ
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-semibold ${
                              (product.stock ?? 0) > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {(product.stock ?? 0) > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ProductStatusToggle
                              productId={product.id}
                              initialStatus={activeStatus}
                            />
                            <span className={`text-xs font-medium ${activeStatus ? 'text-green-400' : 'text-neutral-500'}`}>
                              {activeStatus ? 'Hiện' : 'Ẩn'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">                       
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
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
          </>
        )}

        {/* Modal Thêm / Sửa Sản Phẩm (Tối Ưu Full Mobile & Tránh Thanh URL Trình Duyệt) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/80 p-2 sm:p-4 pt-12 sm:pt-4 backdrop-blur-sm">
            <div className="max-h-[85dvh] sm:max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 text-white shadow-2xl">
              
              {/* HEADER GỌN GÀNG, STICKY CỐ ĐỊNH Ở ĐỈNH MODAL */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3 backdrop-blur">
                <h2 className="text-base sm:text-lg font-bold text-amber-400 truncate">
                  {editingProduct ? `Sửa sản phẩm #${editingProduct.id}` : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                  title="Đóng"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-sm">
                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-amber-500">1. Thông tin cơ bản</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Tên sản phẩm *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="VD: Sục Classic Justin Gắn Jibbit"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Handle (Đường dẫn Slug URL) *</label>
                      <input
                        type="text"
                        required
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="VD: suc-classic-justin-gan-jibbit"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Danh mục *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.title} ({cat.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Mô tả Alt Ảnh Đại Diện</label>
                      <input
                        type="text"
                        value={formData.featured_image_alt}
                        onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="Mô tả thẻ alt..."
                      />
                    </div>
                  </div>

                  {/* LINK ẢNH ĐẠI DIỆN */}
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Link Ảnh Đại Diện (Featured Image) *</label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                        {formData.featured_image_url ? (
                          <img
                            src={formData.featured_image_url}
                            alt="Preview Ảnh chính"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-600">Chưa có</span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.featured_image_url}
                        onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                        className="flex-1 min-w-0 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none text-xs sm:text-sm"
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Mô tả chi tiết sản phẩm</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none text-xs sm:text-sm"
                      placeholder="Mô tả thông tin sản phẩm..."
                    />
                  </div>
                </div>

                {/* 2. HÌNH ẢNH PHỤ */}
                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-amber-400">
                      2. Hình ảnh phụ (Product Images)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, images: [...formData.images, ''] })
                      }
                      className="text-xs text-amber-400 hover:underline"
                    >
                      + Thêm URL ảnh phụ
                    </button>
                  </div>

                  {formData.images.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Ảnh phụ ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-600">Trống</span>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Link URL ảnh phụ..."
                        value={imgUrl}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="flex-1 min-w-0 rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                      />

                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="rounded bg-red-500/10 px-2.5 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. BIẾN THỂ VÀ THUỘC TÍNH */}
                <div className="space-y-4 border-t border-neutral-800 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-amber-500 text-xs sm:text-sm">3. Biến thể (Size, Giá & Kho)</h3>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      + Thêm Biến thể
                    </button>
                  </div>

                  {formData.variants.map((variant, vIdx) => (
                    <div key={vIdx} className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400">Biến thể #{vIdx + 1}</span>
                        {formData.variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="text-xs text-red-400 hover:underline"
                          >
                            Xóa biến thể
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                        <div>
                          <label className="text-[10px] text-neutral-400">Tên biến thể</label>
                          <input
                            type="text"
                            value={variant.title}
                            onChange={(e) => updateVariant(vIdx, 'title', e.target.value)}
                            className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400">Giá bán (đ)</label>
                          <input
                            type="number"
                            value={variant.amount}
                            onChange={(e) => updateVariant(vIdx, 'amount', Number(e.target.value))}
                            className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400">Tồn kho</label>
                          <input
                            type="number"
                            value={variant.quantity_available}
                            onChange={(e) => updateVariant(vIdx, 'quantity_available', Number(e.target.value))}
                            className="w-full rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      {/* Thuộc tính của biến thể */}
                      <div className="space-y-2 border-t border-neutral-900 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-400">Thuộc tính (Màu sắc, Size...)</span>
                          <button
                            type="button"
                            onClick={() => addAttribute(vIdx)}
                            className="text-[11px] text-blue-400 hover:underline"
                          >
                            + Thêm thuộc tính
                          </button>
                        </div>
                        {variant.attributes.map((attr, aIdx) => (
                          <div key={aIdx} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tên (VD: Size)"
                              value={attr.name}
                              onChange={(e) => updateAttribute(vIdx, aIdx, 'name', e.target.value)}
                              className="w-1/2 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              placeholder="Giá trị (VD: M7)"
                              value={attr.value}
                              onChange={(e) => updateAttribute(vIdx, aIdx, 'value', e.target.value)}
                              className="w-1/2 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 border-t border-neutral-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 active:scale-95"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400 disabled:opacity-50 active:scale-95"
                  >
                    {submitting ? 'Đang lưu...' : editingProduct ? 'Lưu cập nhật' : 'Thêm mới'}
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