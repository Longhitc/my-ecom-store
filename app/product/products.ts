export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  description?: string;
  availableForSale?: boolean;
  quantityAvailable?: number;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  type?: 'co-san' | 'order';
  category: string;
  priceRange: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  options?: ProductOption[];
  variants?: ProductVariant[];
  featuredImage: {
    url: string;
    altText?: string;
  };
  images: string[];
}

// --- Dữ liệu bổ sung cho Sản phẩm ID 10 ---
const SUPER_BAE_COLORS = ['Kem', 'Xanh'];
const SUPER_BAE_SIZES = ['W5', 'W6', 'W7', 'W8', 'W9'];

const SUPER_BAE_DESCRIPTION = `🔥 HOT TREND CỦA MÙA HÈ - SỤC SUPER BAE DÂY MÓC 🔥
Nhà em gia nhập đường đua sục hott trend hè 
📌 From đẹp - đế cao - đi êm
📌 Charm gắn sẵn full như hình
Size: w5-w9 (35 đến 40/41)
Chỉ có: 590 xu quá hạt dẻ
Hình nhà em là thật rùi các nàng đừng kêu em chụp nữa ạ.. nhà em chỉ chọn loại xịn xò rip 1.1 thôi.`;

// Bảng tính tồn kho theo Màu & Size: (Cửa Hàng + Kho)
const SUPER_BAE_INVENTORY: Record<string, Record<string, number>> = {
  'Kem': {
    'W5': 4 + 25,  // 29
    'W6': 3 + 8,   // 11
    'W7': 4 + 25,  // 29
    'W8': 3 + 7,   // 10
    'W9': 0        // 0
  },
  'Xanh': {
    'W5': 2 + 27,  // 29
    'W6': 1 + 8,   // 9
    'W7': 3 + 25,  // 28
    'W8': 2 + 6,   // 8
    'W9': 4 + 0    // 4
  }
};

// Danh sách Size đã bỏ phần mở ngoặc ghi cm
const ALL_SIZES_CLEAN = [
  'C7',
  'C8',
  'C9',
  'C10',
  'C11',
  'C12',
  'C13',
  'J1',
  'J2',
  'J3',
  'J4',
  'M4/W6',
  'M5/W7',
  'M6/W8',
  'M7/W9',
  'M8/W10',
  'M9/W11'
];

// Danh sách 2 Loại cho sản phẩm ID 8
const KITTY_TYPES = ['Mặt kitty', 'Cầu vồng'];

// Bảng mapping dữ liệu tồn kho theo 2 Loại & Size đã rút gọn (Tổng = Cửa hàng + Kho)
const KITTY_INVENTORY: Record<string, Record<string, number>> = {
  'Mặt kitty': {
    'C7': 3 + 15 // 18
  },
  'Cầu vồng': {
    'C8': 3 + 6,   // 9
    'C9': 3 + 7,   // 10
    'C10': 3 + 9,  // 12
    'C11': 2 + 2,  // 4
    'C12': 2 + 3,  // 5
    'C13': 1 + 0   // 1
  }
};

const LITERIDE_COLORS = ['Đen', 'Xám', 'Đỏ'];
const LITERIDE_SIZES = [
  'M4/W6',
  'M5/W7',
  'M6/W8',
  'M7/W9',
  'M8/W10',
  'M9/W11',
  'M10/W12',
  'M11'
];

const LITERIDE_DESCRIPTION = `Nhà em về thêm đủ sz mẫu mới toanh luôn
Sục Literide Inmotion nhà em về đủ 3 màu: Đen, Xám, Đỏ ạ!
Size: m4-m11 (36 đến 45)
Chỉ có 355 xu / 1 đôi chỉ bằng 1/3 của store ạ`;

const PRODUCT_DESCRIPTION = `THÔNG TIN GIỚI THIỆU SẢN PHẨM

✔️Siêu phẩm dép sục cho bé (hàng xuất dư chuẩn, ảnh shop tự chụp 100%)

✔️Dép sục lớp đế có hình răng cưa cá sấu rất bám đường,không trơn trượt khi đi trời mưa. Phần thân có nhiều lỗ thoáng tạo sự thông thoáng cho chân

✔️ Dép cực nhẹ,cực êm và thoải mái. Mang cả ngày đều dễ chịu.

2 . ĐO CHÂN BÉ VÀ CHỌN SIZE PHÙ HỢP [ KHÔNG CẦN TRỪ HAO ]

 a -  ĐO CHÂN BÉ: Đặt bàn chân bé lên tờ giấy trắng,sau đó vẽ lại khung bàn chân thật chính xác.

 b -  BẢNG SIZE :

C7- Chiều dài bàn chân 14~14.5cm - size giày 23-24
C8- Chiều dài bàn chân ~15cm – size giày 25-26
C9- Chiều dài bàn chân ~15.5cm – size giày 26-27
C10-Chiều dài bàn chân ~16.5cm – size giày 27-28
C11 - Chiều dài bàn chân ~17.5cm – size giày 28-29
C12- Chiều dài bàn chân ~18cm – size giày 29-30
C13- Chiều dài bàn chân ~19cm – size giày 30-31
J1- Chiều dài bàn chân ~20cm – size giày 32
J2 - Chiều dài bàn chân ~20.5cm – size giày 33
J3 - Chiều dài bàn chân ~21.5cm – size giày 34
J4 - Chiều dài bàn chân ~22.5cm – size giày 35

(Ba mẹ nên chọn đúng size cho bé, không cần trừ hao ạ)

📌Size M4/W6 (Tương đương size 35 - 36)
📌Size M4/W6 (Tương đương size 36 - 37): Chiều dài chân 22.5cm - 23cm
📌Size M5/W7 (Tương đương size 37 - 38): Chiều dài chân 23.5cm - 24cm
📌Size M6/W8 (Tương đương size 38 - 39): Chiều dài chân 24.5cm - 25cm
📌Size M7/W9 (Tương đương size 39 - 40): Chiều dài chân 25.5cm - 26cm
📌Size M8/W10 (Tương đương size 41 - 42): Chiều dài chân 26.5cm - 27cm
📌Size M9/W11 (Tương đương size 43 - 44): Chiều dài chân 27.5cm - 28cm

(Lưu ý: Nếu phom chân dày hoặc muốn đi thoải mái với tất/vớ, quý khách nên tăng 1 size).`;

export const mockProducts: Product[] = [
  {
    id: '1',
    handle: 'leather-bag',
    title: 'Túi đeo da',
    description: 'Túi da phong cách cao cấp, thiết kế gọn nhẹ thích hợp đi chơi, đi làm.',
    type: 'co-san',
    category: 'pk',
    priceRange: { 
      minVariantPrice: { amount: '360000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '360000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590887/samples/ecommerce/leather-bag-gray.jpg',
      altText: 'Túi đeo da chính'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590887/samples/ecommerce/leather-bag-gray.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788775893/e9baf3cee88168df3190.jpg'
    ]
  },
  {
    id: '2',
    handle: 'acme-circles-t-shirt',
    title: 'Giày thể thao',
    description: 'Giày họa tiết cá tính',
    type: 'co-san',
    category: 'pk',
    priceRange: { 
      minVariantPrice: { amount: '220000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '220000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590885/samples/ecommerce/shoes.png',
      altText: 'T-Shoes'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590885/samples/ecommerce/shoes.png',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590897/cld-sample-5.jpg'
    ]
  },
  {
    id: '3',
    handle: 'acme-mug',
    title: 'Ly sứ',
    description: 'Ly sứ giữ nhiệt',
    type: 'co-san',
    category: 'pk',
    priceRange: { 
      minVariantPrice: { amount: '85000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '85000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590894/samples/cup-on-a-table.jpg',
      altText: 'Cup'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590894/samples/cup-on-a-table.jpg'
    ]
  },
  {
    id: '4',
    handle: 'acme-tshirt',
    title: 'Giày Crocks Tím',
    description: 'Giày nhựa thời trang',
    type: 'co-san',
    category: 'crocs-tre-em',
    priceRange: { 
      minVariantPrice: { amount: '250000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '250000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg',
      altText: 'T-Shirt'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/34ee35a00001815fd810.jpg'
    ]
  },
  {
    id: '5',
    handle: 'acme-hat-2',
    title: 'Dép Crocks xỏ ngón',
    description: 'Dép xỏ ngón đi biển',
    type: 'co-san',
    category: 'crocs-tre-em',
    priceRange: { 
      minVariantPrice: { amount: '170000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '170000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg',
      altText: 'Hat 2'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg'
    ]
  },
  {
    id: '6',
    handle: 'acme-mug-2',
    title: 'Giày Crocks Mickey',
    description: 'Dép hoạt hình',
    type: 'co-san',
    category: 'crocs-tre-em',
    priceRange: { 
      minVariantPrice: { amount: '180000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '180000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1788776928/9854fe94fddb7d8524ca.jpg',
      altText: 'Mug 2'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788776928/9854fe94fddb7d8524ca.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788776944/607ab6bab5f535ab6ce4.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788776938/17f5e735e47a64243d6b.jpg'
    ]
  },
  {
    id: '7',
    handle: 'cotton-1',
    title: 'Set cotton hè',
    description: 'Set cotton mẫu mới toanh nhà e về sẵn rồi ạ, size xs, s, m, l, xl (39kg đến 68kg)',
    type: 'co-san',
    category: 'set-bo',
    priceRange: { 
      minVariantPrice: { amount: '175000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '175000', currencyCode: 'VND' } 
    },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1787645116/396e49c24770c62e9f61.jpg',
      altText: 'Set cotton hè'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1787645116/396e49c24770c62e9f61.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1787645129/2396dc3ad28853d60a99.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1787645070/0e7aaca9a21b23457a0a.jpg'
    ]
  },
  {
    id: '8',
    handle: 'suc-cau-vong-hello-kitty',
    title: 'Sục Cầu Vồng Hello Kitty Kèm Full Charm',
    description: PRODUCT_DESCRIPTION,
    type: 'co-san',
    category: 'crocs-tre-em',
    priceRange: {
      minVariantPrice: { amount: '290000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '310000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-type-kitty',
        name: 'Loại',
        values: KITTY_TYPES
      },
      {
        id: 'opt-size-kitty',
        name: 'Size',
        values: ALL_SIZES_CLEAN
      }
    ],
    variants: KITTY_TYPES.flatMap((type, typeIdx) =>
      ALL_SIZES_CLEAN.map((size, sizeIdx) => {
        const isAdultSize = size.startsWith('M');
        const stock = KITTY_INVENTORY[type]?.[size] ?? 0;

        return {
          id: `var-kitty-${typeIdx}-${sizeIdx}`,
          title: `${type} / ${size}`,
          price: {
            amount: isAdultSize ? '310000' : '290000',
            currencyCode: 'VND'
          },
          availableForSale: stock > 0,
          quantityAvailable: stock,
          description: PRODUCT_DESCRIPTION,
          selectedOptions: [
            { name: 'Loại', value: type },
            { name: 'Size', value: size }
          ]
        };
      })
    ),
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/799149959_4646281895601183_6549771293743544267_n.jpg',
      altText: 'Sục Cầu Vồng Hello Kitty'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/799149959_4646281895601183_6549771293743544267_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/792459539_4646281695601203_9142283949428913589_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/798119404_4646282002267839_6990374870986859252_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/798800568_4646281885601184_5610180519922697930_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1788948441/798222224_4646282035601169_4307402522969396159_n.jpg'
    ]
  },
  {
    id: '9',
    handle: 'suc-literide-inmotion',
    title: 'Sục Literide Inmotion 360',
    description: LITERIDE_DESCRIPTION,
    type: 'co-san',
    category: 'crocs-unisex',
    priceRange: {
      minVariantPrice: { amount: '355000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '355000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-color-literide',
        name: 'Màu sắc',
        values: LITERIDE_COLORS
      },
      {
        id: 'opt-size-literide',
        name: 'Size',
        values: LITERIDE_SIZES
      }
    ],
    variants: LITERIDE_COLORS.flatMap((color, colorIdx) =>
      LITERIDE_SIZES.map((size, sizeIdx) => ({
        id: `var-literide-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '355000',
          currencyCode: 'VND'
        },
        description: LITERIDE_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      }))
    ),
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010450/801045966_4648637412032298_3458888062436261448_n.jpg',
      altText: 'Sục Literide Inmotion 360'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010450/801045966_4648637412032298_3458888062436261448_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010450/799859008_4648637682032271_2125085716624523166_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010450/799859027_4648637628698943_864122210124162983_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010450/801870071_4648637675365605_2049975737533579377_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789010449/799414938_4648637605365612_6246133479037152333_n.jpg'
    ]
  },
  {
    id: '10',
    handle: 'suc-super-bae-xich',
    title: 'Sục Super Bae Dây Móc (Xích)',
    description: SUPER_BAE_DESCRIPTION,
    type: 'co-san',
    category: 'crocs-nu',
    priceRange: {
      minVariantPrice: { amount: '590000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '590000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-color-superbae',
        name: 'Màu sắc',
        values: SUPER_BAE_COLORS
      },
      {
        id: 'opt-size-superbae',
        name: 'Size',
        values: SUPER_BAE_SIZES
      }
    ],
    variants: SUPER_BAE_COLORS.flatMap((color, colorIdx) =>
      SUPER_BAE_SIZES.map((size, sizeIdx) => {
        const stock = SUPER_BAE_INVENTORY[color]?.[size] ?? 0;

        return {
          id: `var-superbae-${colorIdx}-${sizeIdx}`,
          title: `${color} / ${size}`,
          price: {
            amount: '590000',
            currencyCode: 'VND'
          },
          availableForSale: stock > 0,
          quantityAvailable: stock,
          description: SUPER_BAE_DESCRIPTION,
          selectedOptions: [
            { name: 'Màu sắc', value: color },
            { name: 'Size', value: size }
          ]
        };
      })
    ),
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789186787/753150770_4590337111195662_2327807593718723329_n.jpg',
      altText: 'Sục Super Bae Dây Móc'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789186787/753150770_4590337111195662_2327807593718723329_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789186786/752169304_4590337851195588_4610764517927117299_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789186785/751136200_4590337747862265_5808733747748062410_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789186773/750721820_4590336887862351_7085382392396555134_n.jpg'
    ]
  }
];