export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  description?: string;
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

// Danh sách toàn bộ size (bao gồm cả trẻ em và người lớn)
const ALL_SIZES = [
  'C7 (23-24 / 14-14.5cm)',
  'C8 (25-26 / 15cm)',
  'C9 (26-27 / 15.5cm)',
  'C10 (27-28 / 16.5cm)',
  'C11 (28-29 / 17.5cm)',
  'C12 (29-30 / 18cm)',
  'C13 (30-31 / 19cm)',
  'J1 (32 / 20cm)',
  'J2 (33 / 20.5cm)',
  'J3 (34 / 21.5cm)',
  'J4 (35 / 22.5cm)',
  'M4/W6 (36-37 / 22.5-23cm)',
  'M5/W7 (37-38 / 23.5-24cm)',
  'M6/W8 (38-39 / 24.5-25cm)',
  'M7/W9 (39-40 / 25.5-26cm)',
  'M8/W10 (41-42 / 26.5-27cm)',
  'M9/W11 (43-44 / 27.5-28cm)'
];

// Mô tả chung duy nhất cho sản phẩm Sục Cầu Vồng Hello Kitty
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
    category: 'tt-namnu',
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
    category: 'gd-crocs',
    priceRange: {
      minVariantPrice: { amount: '290000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '310000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-size',
        name: 'Size',
        values: ALL_SIZES
      }
    ],
    variants: ALL_SIZES.map((size, idx) => {
      // Phân biệt giá cho các size trẻ em (C7->J4) vs người lớn (M4/W6->M9/W11)
      const isAdultSize = size.startsWith('M');
      return {
        id: `var-size-${idx + 1}`,
        title: size,
        price: isAdultSize ? '310000' : '290000',
        description: PRODUCT_DESCRIPTION,
        selectedOptions: [
          { name: 'Size', value: size }
        ]
      };
    }),
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
  }
];