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

interface DynamicOption {
  name: string;
  values: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // State quản lý trạng thái upload ảnh
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});

  // State Khai báo danh sách Thuộc Tính Động
  const [options, setOptions] = useState<DynamicOption[]>([
    { name: 'Màu sắc', values: [''] },
    { name: 'Size', values: [''] },
  ]);

  // State Giá & Tồn kho chung
  const [defaultPrice, setDefaultPrice] = useState<number>(200000);
  const [defaultStock, setDefaultStock] = useState<number>(10);

  const [formData, setFormData] = useState({
    title: '',
    handle: '',
    category: CATEGORY_OPTIONS[0]?.slug || 'tt-nam',
    featured_image_url: '',
    featured_image_alt: '',
    description: '',
    images: [''],
    variants: [] as Variant[],
  });

  // HÀM UPLOAD ẢNH LÊN CLOUDINARY
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'depvaxinh_preset');
    data.append('cloud_name', 'dpsejpp2');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dpsejpp2/image/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        alert('Upload ảnh lên Cloudinary thất bại!');
        return null;
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối khi upload ảnh!');
      return null;
    }
  };

  // HÀM XÓA ẢNH TRÊN CLOUDINARY
  const deleteCloudinaryImage = async (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return;
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      });
    } catch (err) {
      console.error('Lỗi khi xóa ảnh trên Cloudinary:', err);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    const uploadedUrl = await uploadToCloudinary(file);
    if (uploadedUrl) {
      setFormData((prev) => ({ ...prev, featured_image_url: uploadedUrl }));
    }
    setUploadingFeatured(false);
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages((prev) => ({ ...prev, [index]: true }));
    const uploadedUrl = await uploadToCloudinary(file);
    if (uploadedUrl) {
      setFormData((prev) => {
        const newImages = [...prev.images];
        newImages[index] = uploadedUrl;
        return { ...prev, images: newImages };
      });
    }
    setUploadingImages((prev) => ({ ...prev, [index]: false }));
  };

  // Xóa ảnh phụ đồng thời xóa vĩnh viễn trên Cloudinary
  const handleRemoveSubImage = async (index: number) => {
    const targetUrl = formData.images[index];
    if (targetUrl) {
      deleteCloudinaryImage(targetUrl); // Xóa trên Cloudinary
    }
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

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
    setOptions([
      { name: 'Màu sắc', values: [''] },
      { name: 'Size', values: [''] },
    ]);
    setDefaultPrice(200000);
    setDefaultStock(10);

    setFormData({
      title: '',
      handle: '',
      category: CATEGORY_OPTIONS[0]?.slug || 'tt-nam',
      featured_image_url: '',
      featured_image_alt: '',
      description: '',
      images: [''],
      variants: [],
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
            Array.isArray(p.images) && p.images.length > 0 ? p.images : [''];

          const loadedVariants: Variant[] =
            Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [];

          const optionMap = new Map<string, Set<string>>();

          loadedVariants.forEach((v) => {
            (v.attributes || []).forEach((attr) => {
              if (!attr.name) return;
              if (!optionMap.has(attr.name)) {
                optionMap.set(attr.name, new Set());
              }
              if (attr.value) {
                optionMap.get(attr.name)!.add(attr.value);
              }
            });
          });

          const extractedOptions: DynamicOption[] = [];
          optionMap.forEach((valSet, attrName) => {
            const arr = Array.from(valSet);
            extractedOptions.push({
              name: attrName,
              values: arr.length > 0 ? [...arr, ''] : [''],
            });
          });

          if (extractedOptions.length > 0) {
            setOptions(extractedOptions);
          } else {
            setOptions([
              { name: 'Màu sắc', values: [''] },
              { name: 'Size', values: [''] },
            ]);
          }

          if (loadedVariants.length > 0) {
            setDefaultPrice(loadedVariants[0]?.amount || product.price || 0);
            setDefaultStock(loadedVariants[0]?.quantity_available || product.stock || 0);
          }

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

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { name: `Thuộc tính #${prev.length + 1}`, values: [''] },
    ]);
  };

  const handleRemoveOption = (optIndex: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== optIndex));
  };

  const handleOptionNameChange = (optIndex: number, newName: string) => {
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === optIndex ? { ...opt, name: newName } : opt))
    );
  };

  const handleOptionValueChange = (optIndex: number, valIndex: number, newVal: string) => {
    setOptions((prev) =>
      prev.map((opt, idx) => {
        if (idx !== optIndex) return opt;

        const updatedValues = [...opt.values];
        updatedValues[valIndex] = newVal;

        if (valIndex === updatedValues.length - 1 && newVal.trim() !== '') {
          updatedValues.push('');
        } else if (newVal.trim() === '' && valIndex < updatedValues.length - 1) {
          updatedValues.splice(valIndex, 1);
        }

        return { ...opt, values: updatedValues };
      })
    );
  };

  const handleGenerateVariants = () => {
    const validOptions = options
      .map((opt) => ({
        name: opt.name.trim(),
        values: opt.values.map((v) => v.trim()).filter(Boolean),
      }))
      .filter((opt) => opt.name !== '' && opt.values.length > 0);

    if (validOptions.length === 0) {
      alert('Vui lòng khai báo ít nhất 1 Thuộc tính kèm giá trị hợp lệ!');
      return;
    }

    const cartesian = (args: string[][]): string[][] => {
      const r: string[][] = [];
      const max = args.length - 1;
      function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i]!.length; j < l; j++) {
          const a = [...arr, args[i]![j]!];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const allValuesMatrix = validOptions.map((opt) => opt.values);
    const combinations = cartesian(allValuesMatrix);

    const generated: Variant[] = combinations.map((combo) => {
      const attributes: VariantAttribute[] = combo.map((val, idx) => ({
        name: validOptions[idx]!.name,
        value: val,
      }));

      const variantTitle = combo.join(' / ');

      return {
        title: variantTitle,
        amount: Number(defaultPrice) || 0,
        quantity_available: Number(defaultStock) || 0,
        attributes,
      };
    });

    setFormData((prev) => ({ ...prev, variants: generated }));
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

  const addVariantManually = () => {
    const validAttrNames = options
      .map((opt) => opt.name.trim())
      .filter(Boolean);

    const initialAttributes: VariantAttribute[] = validAttrNames.map((name) => ({
      name,
      value: '',
    }));

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          title: `Biến thể ${prev.variants.length + 1}`,
          amount: defaultPrice || 0,
          quantity_available: defaultStock || 0,
          attributes: initialAttributes,
        },
      ],
    }));
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

  const updateVariantAttribute = (variantIndex: number, attrIndex: number, newValue: string) => {
    setFormData((prev) => {
      const updatedVariants = prev.variants.map((v, vIdx) => {
        if (vIdx !== variantIndex) return v;

        const updatedAttrs = (v.attributes || []).map((attr, aIdx) =>
          aIdx === attrIndex ? { ...attr, value: newValue } : attr
        );

        const newTitle = updatedAttrs
          .map((a) => a.value.trim())
          .filter(Boolean)
          .join(' / ');

        return {
          ...v,
          title: newTitle || `Biến thể #${variantIndex + 1}`,
          attributes: updatedAttrs,
        };
      });

      return { ...prev, variants: updatedVariants };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.variants.length === 0) {
      alert('Sản phẩm phải có ít nhất 1 biến thể! Vui lòng bấm áp dụng tạo biến thể.');
      return;
    }

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
        {/* Header */}
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
            {/* GIAO DIỆN MOBILE */}
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

            {/* GIAO DIỆN DESKTOP */}
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

        {/* Modal Thêm / Sửa Sản Phẩm */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/80 p-2 sm:p-4 pt-12 sm:pt-4 backdrop-blur-sm">
            <div className="max-h-[85dvh] sm:max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 text-white shadow-2xl">

              {/* Header Modal */}
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
                        placeholder="VD: Sục LiteRide 360 Crocs Chính Hãng"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Handle (Slug URL) *</label>
                      <input
                        type="text"
                        required
                        value={formData.handle}
                        onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                        placeholder="VD: suc-literide-360-crocs-chinh-hang"
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

                  {/* UPLOAD ẢNH ĐẠI DIỆN */}
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Ảnh Đại Diện Sản Phẩm *</label>
                    <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                        {formData.featured_image_url ? (
                          <img
                            src={formData.featured_image_url}
                            alt="Preview Ảnh chính"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-neutral-500 text-center px-1">Chưa chọn ảnh</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        {uploadingFeatured ? (
                          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                            <span className="animate-spin">🔄</span> Đang tải ảnh...
                          </div>
                        ) : formData.featured_image_url ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                              ✅ Đã tải
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500">Chưa có ảnh đại diện</span>
                        )}

                        <div>
                          <label className="inline-block cursor-pointer rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-700 border border-neutral-700">
                            {uploadingFeatured ? '⏳ Đang xử lý...' : formData.featured_image_url ? '🔄 Đổi ảnh đại diện' : '📁 Tải ảnh lên'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFeaturedImageUpload}
                              disabled={uploadingFeatured}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MÔ TẢ SẢN PHẨM */}
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Mô tả chi tiết sản phẩm</label>
                    <textarea
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none text-xs sm:text-sm leading-relaxed"
                      placeholder="Mô tả thông tin chi tiết sản phẩm..."
                    />
                  </div>
                </div>

                {/* 2. HÌNH ẢNH PHỤ */}
                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <label className="text-sm font-semibold text-amber-400 block">
                    2. Hình ảnh phụ (Product Images)
                  </label>

                  {formData.images.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Ảnh phụ ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-500">Chưa có</span>
                        )}
                      </div>

                      <div className="flex flex-1 items-center justify-between min-w-0">
                        {uploadingImages[index] ? (
                          <span className="text-xs text-amber-400 font-medium animate-pulse">
                            ⏳ Đang tải lên...
                          </span>
                        ) : imgUrl ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                            ✅ Đã tải
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-500">Ảnh phụ #{index + 1}</span>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer rounded-lg bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-700 border border-neutral-700 shrink-0">
                            {uploadingImages[index] ? '⏳' : imgUrl ? 'Đổi ảnh' : '📁 Tải ảnh'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSubImageUpload(e, index)}
                              disabled={Boolean(uploadingImages[index])}
                              className="hidden"
                            />
                          </label>

                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubImage(index)}
                              className="rounded bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, images: [...formData.images, ''] })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-neutral-800 transition"
                    >
                      + Thêm ô ảnh phụ
                    </button>
                  </div>
                </div>

                {/* 3. KHAI BÁO THUỘC TÍNH ĐỘNG */}
                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <h3 className="font-semibold text-amber-400 text-sm">3. Khai báo thuộc tính sản phẩm</h3>

                  {options.map((opt, optIdx) => (
                    <div key={optIdx} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold text-neutral-400 shrink-0">
                            Thuộc tính #{optIdx + 1}:
                          </span>
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => handleOptionNameChange(optIdx, e.target.value)}
                            placeholder="Nhập tên thuộc tính (VD: Màu sắc, Size, Loại...)"
                            className="w-full max-w-xs rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="text-xs text-red-400 hover:underline shrink-0"
                          >
                            Xóa thuộc tính này
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {opt.values.map((val, valIdx) => (
                          <input
                            key={valIdx}
                            type="text"
                            value={val}
                            onChange={(e) => handleOptionValueChange(optIdx, valIdx, e.target.value)}
                            placeholder={valIdx === opt.values.length - 1 ? `+ Nhập giá trị...` : 'Tên giá trị...'}
                            className="w-28 sm:w-36 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-neutral-800 transition"
                    >
                      + Thêm Thuộc Tính
                    </button>
                  </div>
                </div>

                {/* 4. THIẾT LẬP GIÁ & TỒN KHO MẶC ĐỊNH + NÚT ÁP DỤNG */}
                <div className="space-y-3 border-t border-neutral-800 pt-4">
                  <h3 className="font-semibold text-amber-400 text-sm">4. Thiết lập Giá & Tồn kho chung</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-end">
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Giá bán chung (đ)</label>
                      <input
                        type="number"
                        value={defaultPrice}
                        onChange={(e) => setDefaultPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-neutral-400">Tồn kho chung</label>
                      <input
                        type="number"
                        value={defaultStock}
                        onChange={(e) => setDefaultStock(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleGenerateVariants}
                        className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-amber-400 active:scale-95"
                      >
                        ⚡ Áp dụng & Tạo toàn bộ biến thể
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. DANH SÁCH BIẾN THỂ (GỌN TRÊN 1 HÀNG NGANG SIÊU TIẾT KIỆM SPACE) */}
                <div className="space-y-2 border-t border-neutral-800 pt-4">
                  <h3 className="font-semibold text-amber-500 text-xs sm:text-sm">
                    5. Biến thể đã sinh ({formData.variants.length})
                  </h3>

                  {formData.variants.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-500">
                      Chưa có biến thể nào. Khai báo thuộc tính ở mục 3 và bấm "⚡ Áp dụng & Tạo toàn bộ biến thể" ở mục 4!
                    </div>
                  ) : (
                    formData.variants.map((variant, vIdx) => (
                      <div
                        key={vIdx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs"
                      >
                        {/* Tên biến thể */}
                        <span className="font-bold text-amber-400 shrink-0 min-w-[120px]">
                          #{vIdx + 1}: {variant.title || `Biến thể ${vIdx + 1}`}
                        </span>

                        {/* Giá bán & Kho chung 1 dòng */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-neutral-400">Giá:</span>
                            <input
                              type="number"
                              value={variant.amount}
                              onChange={(e) => updateVariant(vIdx, 'amount', Number(e.target.value))}
                              className="w-20 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-neutral-400">Kho:</span>
                            <input
                              type="number"
                              value={variant.quantity_available}
                              onChange={(e) => updateVariant(vIdx, 'quantity_available', Number(e.target.value))}
                              className="w-14 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Các Thuộc tính chỉnh sửa trực tiếp chung 1 dòng */}
                        <div className="flex flex-wrap items-center gap-1.5 flex-1">
                          {(variant.attributes || []).map((attr, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-1 rounded bg-neutral-900 border border-neutral-800 px-1.5 py-0.5">
                              <span className="text-[10px] font-bold text-neutral-400">{attr.name}:</span>
                              <input
                                type="text"
                                value={attr.value}
                                onChange={(e) => updateVariantAttribute(vIdx, aIdx, e.target.value)}
                                className="w-16 rounded border border-neutral-800 bg-neutral-950 px-1 py-0.5 text-[11px] text-white focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Nút Xóa */}
                        <button
                          type="button"
                          onClick={() => removeVariant(vIdx)}
                          className="text-xs text-red-400 hover:underline shrink-0"
                        >
                          Xóa
                        </button>
                      </div>
                    ))
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={addVariantManually}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-neutral-800 transition"
                    >
                      + Thêm biến thể thủ công
                    </button>
                  </div>
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