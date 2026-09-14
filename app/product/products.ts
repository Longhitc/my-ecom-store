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

const BALLET_FLOWER_SIZES = ['W5', 'W6', 'W7', 'W8', 'W9'];

const BALLET_FLOWER_DESCRIPTION = `🔥 Lên cho các mom một em ballet hoá tiết hoa hồng xinh iu, nhanh tay thì còn chậm tay là khuyết size e khum chịu đâu nha 🫡
Chuẩn xịn đét ạ full túi
Size: w5-w9
Giá: 240 xu / tặng kèm charm thường ngẫu nhiên
Charm như hình; 49 xu / 1 sét`;

const BALLET_FLOWER_INVENTORY: Record<string, number> = {
  'W5': 0,
  'W6': 0,
  'W7': 0,
  'W8': 0,
  'W9': 0
};

// --- Dữ liệu bổ sung cho Sản phẩm ID 12 (Sục Yukon Vista) ---
const YUKON_COLORS = ['Đen', 'Nâu', 'Bò'];
const YUKON_SIZES = ['M7', 'M8', 'M9', 'M10'];

const YUKON_DESCRIPTION = `📌 Sục yukon vista nhà em sẵn hàng, khách iu lên đơn em cho kho xuất ngay nhé.
Hàng chuẩn xịn đét full hộp làm quà tặng cựa sang.

Chất liệu: Nhựa tế bào có thiết kế hình vòm linh hoạt, nhẹ êm và linh hoạt. Vật liệu được đúc hoàn toàn bền và chắc chắn.

Form dép: Thuộc dòng Relaxed Fit form vừa, mang không quá ôm và chiều dài tiêu chuẩn vừa chân, đem lại cảm giác thoải mái khi mang.

Ưu điểm: Dép được làm từ chất liệu nhựa, đế chống trơn trượt

Hướng dẫn chọn size: M7 đến M10 (tương ứng với size vn là 40 đến 44)
M7 = size 40 ( chân 24,5 - 25 cm).
M8 = size 41 ( chân 25,5 - 26 cm).
M9 = size 42 ( chân 26,5 - 27 cm).
M10 = size 43 ( chân 27,5 - 28 cm).
M11 = size 44 ( chân 28,5 - 29 cm).

Sz; m7 đến m10`;

// Bảng tính tồn kho theo Màu (Cột B) & Size (Tổng Cột C + Cột D từ file Excel)
const YUKON_INVENTORY: Record<string, Record<string, number>> = {
  'Đen': {
    'M7': 1 + 6,   // 7
    'M8': 2 + 15,  // 17
    'M9': 3 + 15,  // 18
    'M10': 3 + 7   // 10
  },
  'Nâu': {
    'M7': 3 + 5,   // 8
    'M8': 3 + 12,  // 15
    'M9': 3 + 15,  // 18
    'M10': 3 + 6   // 9
  },
  'Bò': {
    'M7': 2 + 5,   // 7
    'M8': 3 + 15,  // 18
    'M9': 3 + 15,  // 18
    'M10': 3 + 7   // 10
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

// 1. Khai báo mô tả & các thông số dữ liệu cho Sục LiteRide 360
export const LITERIDE_360_DESCRIPTION = `🔥 SỤC LITERIDE 360 – CROCS.S CHÍNH HÃNG 🔥
Hàng xuất xịn đét – đã về sẵn tại nhà em rồi ạ 🥰

📌 Size: M4 – M11 (tuỳ màu)
👍 Tương đương khoảng size 36 – 44
g Giá: 320K/đôi – FULL HỘP 📦`;

export const LITERIDE_360_COLORS = [
  'Đen đỏ',
  'Đen trơn đế ghi',
  'Đen loang vàng',
  'Rêu',
  'Navy trơn đế trắng',
  'Ghi trơn đế trắng',
  'Ghi loang xanh',
  'Blue'
];

export const LITERIDE_360_SIZES = ['M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11'];

// Bảng tổng hợp số lượng tồn kho (Cột C + Cột D):
// Đen đỏ: M4:3, M5:1+2=3, M6:1+7=8, M9:1
// Đen trơn đế ghi: M4:3+5=8, M5:3+5=8, M6:4+12=16, M7:3+17=20, M8:1+15=16, M9:3+10=13, M10:3+3=6, M11:1
// Đen loang vàng: M4:3+6=9, M5:3+6=9, M6:3+16=19, M7:3+24=27, M8:3+18=21, M9:5+17=22, M10:3+8=11, M11:2+3=5
// Rêu: M4:6+15=21, M5:2
// Navy trơn đế trắng: M4:3+9=12, M5:3+6=9, M6:3+4=7, M7:2+12=14, M8:2, M9:3+4=7
// Ghi trơn đế trắng: M4:3+2=5, M5:3+3=6, M6:3+4=7, M7:3+2=5, M8:3+1=4, M9:2+10=12
// Ghi loang xanh: M4:5
// Blue: M4:2
export const LITERIDE_360_INVENTORY: Record<string, Record<string, number>> = {
  'Đen đỏ': { M4: 3, M5: 3, M6: 8, M9: 1 },
  'Đen trơn đế ghi': { M4: 8, M5: 8, M6: 16, M7: 20, M8: 16, M9: 13, M10: 6, M11: 1 },
  'Đen loang vàng': { M4: 9, M5: 9, M6: 19, M7: 27, M8: 21, M9: 22, M10: 11, M11: 5 },
  'Rêu': { M4: 21, M5: 2 },
  'Navy trơn đế trắng': { M4: 12, M5: 9, M6: 7, M7: 14, M8: 2, M9: 7 },
  'Ghi trơn đế trắng': { M4: 5, M5: 6, M6: 7, M7: 5, M8: 4, M9: 12 },
  'Ghi loang xanh': { M4: 5 },
  'Blue': { M4: 2 }
};

// 1. Khai báo mô tả & thông số dữ liệu cho Sục Minecraft V2
export const MINECRAFT_V2_DESCRIPTION = `🔥 Sục Minecraft đèn trẻ em - hàng về sẵn kho 🔥

Size: c7-j4 ( 24 đến 36)
Nhà em về số lượng ít ạ ,, vợt ngay cho bé mang hè đi chơi nè cả nhà chuẩn xin full hộp
Kiểm tra trước khi nhận- hỗ trợ đổi sz đổi mẫu
Giá: 310k/ 1 đ full chaim xịn y ảnh`;

export const MINECRAFT_V2_TYPES = [
  'TRẺ EM ĐÈN',
  'TRE EM K ĐÈN',
  'NL CÓ ĐÈN'
];



export const MINECRAFT_V2_SIZES = ['C7', 'C8', 'C9', 'C10', 'M7'];

// Bảng tổng hợp số lượng tồn kho (Cửa hàng + Kho):
// TRẺ EM ĐÈN: C7: 5+2=7, C8: 3+6=9, C9: 3+15=18, C10: 4+5=9
// TRE EM K ĐÈN: hết
// NL CÓ ĐÈN: M7: 1
export const MINECRAFT_V2_INVENTORY: Record<string, Record<string, number>> = {
  'TRẺ EM ĐÈN': { C7: 7, C8: 9, C9: 18, C10: 9 },
  'TRE EM K ĐÈN': {},
  'NL CÓ ĐÈN': { M7: 1 }
};

export const MICKEY_SMILE_DESCRIPTION = `🔥 sục mickey cười chuẩn xuất xịn mẫu mới toanh nhà em mới về sẵn 🔥

thiết kế dáng sục classic thoáng mát, nhẹ và êm. Phối màu đen với đỏ siêu sạch nhìn rất xinh iu và nổi bật.

size: c7-j3 ( 24 - 35)
Giá: 299k/ 1 đôi`;

export const MICKEY_SMILE_TYPES = [
  'trẻ em',
  'người lớn'
];

export const MICKEY_SMILE_SIZES = ['C9'];

export const MICKEY_SMILE_INVENTORY: Record<string, Record<string, number>> = {
  'trẻ em': { C9: 1 },
  'người lớn': {}
};

export const ECHO_SLIDE_DESCRIPTION = `🔥 DÉP QUAI NGANG ECHO SLIDE – CHÍNH HÃNG 🔥
Thiết kế cá tính, thời trang, siêu êm và nhẹ. 

📌 Phối màu: Ghi, Kem, Đen
📌 Size: M4 – M11 (Tương đương 36 – 45)
📦 Hàng nhận đặt trước 10-15 ngày.`;

export const ECHO_SLIDE_COLORS = ['Ghi', 'Kem', 'Đen'];
export const ECHO_SLIDE_SIZES = ['M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11'];

// Tồn kho hết sạch (0 cho tất cả màu và size)
export const ECHO_SLIDE_INVENTORY: Record<string, Record<string, number>> = {
  'Ghi': {},
  'Kem': {},
  'Đen': {}
};

export const OOFOS_FLIP_FLOPS_DESCRIPTION = `Giá Siêu tốt : 155k/ 1 đôi Các chị không nghe nhầm đâu ah.
😱😱 OMG
📌 EM NÀY THỰC SỰ ĐỈNH NÓC KỊCH TRẦN - bộ màu quá xuất sắc luôn nhé cả nhà ! Đi biển thì cực cool luôn
👉 Dép sức khỏe vẫn mãi chân ái - êm & bền rất phù hợp cho chị em cô bác
Hàng bao đẹp & thoải mái`;

export const OOFOS_FLIP_FLOPS_COLORS = ['tím', 'hồng cam'];
export const OOFOS_FLIP_FLOPS_SIZES = ['36', '37', '40'];

// Bảng tổng hợp tồn kho từ Cột C (Các size 36, 37 hết hàng = 0, size 40 lấy theo Cột C):
// tím: 40x3 => { '36': 0, '37': 0, '40': 3 }
// hồng cam: 40x1 => { '36': 0, '37': 0, '40': 1 }
export const OOFOS_FLIP_FLOPS_INVENTORY: Record<string, Record<string, number>> = {
  'tím': { '36': 0, '37': 0, '40': 3 },
  'hồng cam': { '36': 0, '37': 0, '40': 1 }
};

export const KUROMI_DESCRIPTION = `💜 SỤC KUROMI NHÀ EM SẴN HÀNG TRẺ EM VÀ NGƯỜI LỚN 💜

Size:
Trẻ em: c7 đến j4 ( 23 đến 37)
Người lớn: m4 - m6 ( 36/37 đến 39)
Za; 315k kèm charm hãng y hình full hộp`;

export const KUROMI_TYPES = ['Trẻ em', 'người lớn'];
export const KUROMI_SIZES = ['c7', 'c8', 'c9', 'c10', 'j4', 'm4'];

// Bảng tổng hợp tồn kho (Cửa hàng + Kho):
// Trẻ em: c7 (3+2=5), c8 (2+0=2), c9 (3+5=8), c10 (1+0=1), j4 (5+6=11)
// người lớn: m4 (1+0=1)
export const KUROMI_INVENTORY: Record<string, Record<string, number>> = {
  'Trẻ em': {
    c7: 5,
    c8: 2,
    c9: 8,
    c10: 1,
    j4: 11
  },
  'người lớn': {
    m4: 1
  }
};

export const YUKON_SLIDE_DESCRIPTION = `🔥 Nay nhà em trả od lê yukon, nàng nào cần thay Dép cho Ox hoặc zai lớn ới em nha.. hàng chuẩn 1.1
Size: m7-m11 ( 40 đến 46)
Chỉ ; 295 xu/ 1đ`;

export const YUKON_SLIDE_COLORS = ['đen', 'nâu', 'be'];
export const YUKON_SLIDE_SIZES = ['m7', 'm8', 'm9', 'm10', 'm11'];

// Bảng tổng hợp tồn kho (Cửa hàng + Kho):
// đen: hết (0)
// nâu: hết (0)
// be: hết (0)
export const YUKON_SLIDE_INVENTORY: Record<string, Record<string, number>> = {
  'đen': {},
  'nâu': {},
  'be': {}
};

export const JUSTIN_CLASSIC_DESCRIPTION = `📌 Sục Classic Justin Gắn Jibbit chuẩn xuất xịn
Size: m4 đến m7 ( 36 đến 40)
Giá: 285k full hộp`;

export const JUSTIN_CLASSIC_COLORS = ['tím', 'vàng'];
export const JUSTIN_CLASSIC_SIZES = ['m4', 'm5', 'm6', 'm7'];

// Bảng tổng hợp tồn kho (Cửa hàng + Kho):
// tím: m5 (2 + 6 = 8), m7 (2 + 11 = 13)
// vàng: hết (0)
export const JUSTIN_CLASSIC_INVENTORY: Record<string, Record<string, number>> = {
  'tím': {
    m5: 8,
    m7: 13
  },
  'vàng': {}
};

export const BUCKLE_SLIDE_DESCRIPTION = `Đẹp mê ạ hôm trước nhiều nàng hỏi quá mà em ko đủ chia nay em về thêm rùi ạ..

mẫu Buckle này kho nhà em về sẵn ạ.. kho xuất ngay.
Size m4,5,6,7 tương đương 36->39/40. Tặng 6 charm
Gi.á; 275 / 1 đôi chỉ bằng 1/3 của sto-re`;

export const BUCKLE_SLIDE_COLORS = ['hồng', 'xanh', 'kem'];
export const BUCKLE_SLIDE_SIZES = ['m4', 'm5', 'm6', 'm7'];

// Bảng tổng hợp tồn kho (Cửa hàng + Kho):
// hồng: m5 (6+0=6), m6 (6+0=6)
// xanh: m6 (4+0=4), m7 (2+0=2)
// kem: m4 (2+15=17), m5 (5+0=5), m6 (3+0=3), m7 (1+2=3)
export const BUCKLE_SLIDE_INVENTORY: Record<string, Record<string, number>> = {
  'hồng': {
    m5: 6,
    m6: 6
  },
  'xanh': {
    m6: 4,
    m7: 2
  },
  'kem': {
    m4: 17,
    m5: 5,
    m6: 3,
    m7: 3
  }
};

export const HOA_LAN_FANCY_DESCRIPTION = `🔥 SỤC HOA LAN FANCY CROCS XUẤT XỊN

✨ Sục màu xanh pastel mix charm xinh xắn, kết hợp nơ lụa cực nữ tính, thiết kế from classic nhẹ êm, đi chơi - đi học đều xinh iu ạ, mẫu mới toanh của hãng

Size: m4-m7( 36-40)

Za; : 385k`;

export const HOA_LAN_FANCY_COLORS = ['hoa lan xanh', 'hoa hồng'];
export const HOA_LAN_FANCY_SIZES = ['m4', 'm5', 'm6', 'm7'];

// Bảng tổng hợp tồn kho (Cửa hàng + Kho):
// hoa lan xanh: m4 (2 + 4 = 6), m5 (3 + 4 = 7), m6 (2 + 0 = 2)
// hoa hồng: hết (0)
export const HOA_LAN_FANCY_INVENTORY: Record<string, Record<string, number>> = {
  'hoa lan xanh': {
    m4: 6,
    m5: 7,
    m6: 2
  },
  'hoa hồng': {}
};

export const mockProducts: Product[] = [
  {
  id: '1',
  handle: 'dep-le-yukon',
  title: 'Dép Lê Yukon Nam',
  description: YUKON_SLIDE_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-nam',
  priceRange: {
    minVariantPrice: { amount: '295000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '295000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-yukon-slide',
      name: 'Màu sắc',
      values: YUKON_SLIDE_COLORS
    },
    {
      id: 'opt-size-yukon-slide',
      name: 'Size',
      values: YUKON_SLIDE_SIZES
    }
  ],
  variants: YUKON_SLIDE_COLORS.flatMap((color, colorIdx) =>
    YUKON_SLIDE_SIZES.map((size, sizeIdx) => {
      const stock = YUKON_SLIDE_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-yukon-slide-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '295000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: YUKON_SLIDE_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377073/752916703_4594781804084526_4373216593386416449_n.jpg',
    altText: 'Dép Lê Yukon Nam'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377073/752916703_4594781804084526_4373216593386416449_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377043/754849681_4594781810751192_3252977652622191422_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377043/753287991_4594781860751187_4063085122007180854_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377043/753255119_4594781687417871_7168826447353564445_n.jpg'
  ]
},{
  id: '2',
  handle: 'suc-classic-justin-gan-jibbit',
  title: 'Sục Classic Justin Gắn Jibbit',
  description: JUSTIN_CLASSIC_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-unisex',
  priceRange: {
    minVariantPrice: { amount: '285000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '285000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-justin-classic',
      name: 'Màu sắc',
      values: JUSTIN_CLASSIC_COLORS
    },
    {
      id: 'opt-size-justin-classic',
      name: 'Size',
      values: JUSTIN_CLASSIC_SIZES
    }
  ],
  variants: JUSTIN_CLASSIC_COLORS.flatMap((color, colorIdx) =>
    JUSTIN_CLASSIC_SIZES.map((size, sizeIdx) => {
      const stock = JUSTIN_CLASSIC_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-justin-classic-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '285000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: JUSTIN_CLASSIC_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377412/753170029_4592251451004228_7159675816161462838_n.jpg',
    altText: 'Sục Classic Justin Gắn Jibbit'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377412/753170029_4592251451004228_7159675816161462838_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377412/752538902_4592251464337560_7879488600388731416_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789377412/752022560_4592251497670890_5738390911947593770_n.jpg'
  ]
},{
  id: '3',
  handle: 'suc-buckle-khuy-sat',
  title: 'Sục Buckle Khuy Sắt Tặng Charm',
  description: BUCKLE_SLIDE_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-nu',
  priceRange: {
    minVariantPrice: { amount: '275000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '275000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-buckle-slide',
      name: 'Màu sắc',
      values: BUCKLE_SLIDE_COLORS
    },
    {
      id: 'opt-size-buckle-slide',
      name: 'Size',
      values: BUCKLE_SLIDE_SIZES
    }
  ],
  variants: BUCKLE_SLIDE_COLORS.flatMap((color, colorIdx) =>
    BUCKLE_SLIDE_SIZES.map((size, sizeIdx) => {
      const stock = BUCKLE_SLIDE_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-buckle-slide-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '275000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: BUCKLE_SLIDE_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789378598/750585196_4590305251198848_3544266067419428962_n.jpg',
    altText: 'Sục Buckle Khuy Sắt Tặng Charm'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789378598/750585196_4590305251198848_3544266067419428962_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789378599/752509370_4590305274532179_1594443216446809171_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789378598/750632626_4590305311198842_6479987238657806061_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789378598/749652295_4590305327865507_3614672051618428107_n.jpg'
  ]
},
  {
  id: '4',
  handle: 'suc-kuromi',
  title: 'Sục Kuromi Trẻ Em & Người Lớn',
  description: KUROMI_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-tre-em',
  priceRange: {
    minVariantPrice: { amount: '315000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '315000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-type-kuromi',
      name: 'Loại',
      values: KUROMI_TYPES
    },
    {
      id: 'opt-size-kuromi',
      name: 'Size',
      values: KUROMI_SIZES
    }
  ],
  variants: KUROMI_TYPES.flatMap((type, typeIdx) =>
    KUROMI_SIZES.map((size, sizeIdx) => {
      const stock = KUROMI_INVENTORY[type]?.[size] ?? 0;

      return {
        id: `var-kuromi-${typeIdx}-${sizeIdx}`,
        title: `${type} / ${size}`,
        price: {
          amount: '315000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: KUROMI_DESCRIPTION,
        selectedOptions: [
          { name: 'Loại', value: type },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg',
    altText: 'Sục Kuromi Trẻ Em & Người Lớn'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789376321/769095796_4610547879174585_5447402148710876454_n.jpg'
  ]
},
  {
  id: '5',
  handle: 'dep-xo-ngon-oofos',
  title: 'Dép Xỏ Ngón Oofos Tăng Chiều Cao',
  description: OOFOS_FLIP_FLOPS_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-nu',
  priceRange: {
    minVariantPrice: { amount: '155000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '155000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-oofos-flip-flops',
      name: 'Màu sắc',
      values: OOFOS_FLIP_FLOPS_COLORS
    },
    {
      id: 'opt-size-oofos-flip-flops',
      name: 'Size',
      values: OOFOS_FLIP_FLOPS_SIZES
    }
  ],
  variants: OOFOS_FLIP_FLOPS_COLORS.flatMap((color, colorIdx) =>
    OOFOS_FLIP_FLOPS_SIZES.map((size, sizeIdx) => {
      const stock = OOFOS_FLIP_FLOPS_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-oofos-flip-flops-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '155000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: OOFOS_FLIP_FLOPS_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg',
    altText: 'Dép Xỏ Ngón Oofos'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789375871/763333818_4610817389147634_3107634258852493810_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789375871/769007328_4610817645814275_8366584682955621240_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789375870/769222532_4610817639147609_1122250811929745037_n.jpg'
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
  },
  {
    id: '12',
    handle: 'suc-yukon-vista',
    title: 'Sục Yukon Vista',
    description: YUKON_DESCRIPTION,
    type: 'co-san',
    category: 'crocs-nam',
    priceRange: {
      minVariantPrice: { amount: '360000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '360000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-color-yukon',
        name: 'Màu sắc',
        values: YUKON_COLORS
      },
      {
        id: 'opt-size-yukon',
        name: 'Size',
        values: YUKON_SIZES
      }
    ],
    variants: YUKON_COLORS.flatMap((color, colorIdx) =>
      YUKON_SIZES.map((size, sizeIdx) => {
        const stock = YUKON_INVENTORY[color]?.[size] ?? 0;

        return {
          id: `var-yukon-${colorIdx}-${sizeIdx}`,
          title: `${color} / ${size}`,
          price: {
            amount: '360000',
            currencyCode: 'VND'
          },
          availableForSale: stock > 0,
          quantityAvailable: stock,
          description: YUKON_DESCRIPTION,
          selectedOptions: [
            { name: 'Màu sắc', value: color },
            { name: 'Size', value: size }
          ]
        };
      })
    ),
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188906/786443038_4629788813917158_2869576017246042416_n.jpg', // Bạn có thể thay bằng link ảnh Cloudinary chính xác của Yukon Vista
      altText: 'Sục Yukon Vista'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188906/785980182_4629790920583614_6096739423110358319_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/785946717_4629790850583621_8987625036819882648_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/784734032_4629790817250291_4050555444544626999_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/784389477_4629790897250283_5228277691676290859_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/785780110_4629790927250280_4434883332454340599_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/784734061_4629790767250296_6295477000931762811_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188903/784252576_4629790890583617_7350237718492449098_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188903/784252594_4629790867250286_5950895519657646309_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188903/784233148_4629790823916957_8082349159696873564_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789188904/784430489_4629790777250295_4925784083961105313_n.jpg'
    ]
  },
  {
    id: '13',
    handle: 'suc-ballet-hoa-hong',
    title: 'Sục Ballet Họa Tiết Hoa Hồng',
    description: BALLET_FLOWER_DESCRIPTION,
    type: 'co-san',
    category: 'crocs-nu',
    priceRange: {
      minVariantPrice: { amount: '240000', currencyCode: 'VND' },
      maxVariantPrice: { amount: '240000', currencyCode: 'VND' }
    },
    options: [
      {
        id: 'opt-size-ballet-flower',
        name: 'Size',
        values: BALLET_FLOWER_SIZES
      }
    ],
    variants: BALLET_FLOWER_SIZES.map((size, sizeIdx) => {
      const stock = BALLET_FLOWER_INVENTORY[size] ?? 0;

      return {
        id: `var-ballet-flower-${sizeIdx}`,
        title: size,
        price: {
          amount: '240000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: BALLET_FLOWER_DESCRIPTION,
        selectedOptions: [
          { name: 'Size', value: size }
        ]
      };
    }),
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789279996/792459533_4641740492721990_5719767593256362431_n.jpg',
      altText: 'Sục Ballet Họa Tiết Hoa Hồng'
    },
    images: [
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789279996/792459533_4641740492721990_5719767593256362431_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789279996/792262953_4641740762721963_4756769126454067393_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789279996/794038980_4641740809388625_2572959379147747609_n.jpg',
      'https://res.cloudinary.com/dpsejpp2/image/upload/v1789279996/790614988_4641740772721962_750378558989976451_n.jpg'
    ]
  },
  {
  id: '14',
  handle: 'suc-literide-360',
  title: 'Sục LiteRide 360 – Crocs.s Chính Hãng',
  description: LITERIDE_360_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-unisex',
  priceRange: {
    minVariantPrice: { amount: '320000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '320000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-literide-360',
      name: 'Màu sắc',
      values: LITERIDE_360_COLORS
    },
    {
      id: 'opt-size-literide-360',
      name: 'Size',
      values: LITERIDE_360_SIZES
    }
  ],
  variants: LITERIDE_360_COLORS.flatMap((color, colorIdx) =>
    LITERIDE_360_SIZES.map((size, sizeIdx) => {
      const stock = LITERIDE_360_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-literide-360-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '320000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: LITERIDE_360_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789356473/802821251_4649478108614895_4726261163878088648_n.jpg',
    altText: 'Sục LiteRide 360 – Crocs.s Chính Hãng'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789356473/802821251_4649478108614895_4726261163878088648_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789356473/801885767_4649478168614889_7940688817604815763_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789356473/802863675_4649478115281561_713581941695720013_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789356473/801988637_4649478071948232_641457859441116096_n.jpg'
  ]
},
{
  id: '15',
  handle: 'suc-minecraft-v2',
  title: 'Sục Minecraft V2 Đèn Trẻ Em & Người Lớn',
  description: MINECRAFT_V2_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-tre-em',
  priceRange: {
    minVariantPrice: { amount: '310000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '310000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-type-minecraft-v2',
      name: 'Loại',
      values: MINECRAFT_V2_TYPES
    },
    {
      id: 'opt-size-minecraft-v2',
      name: 'Size',
      values: MINECRAFT_V2_SIZES
    }
  ],
  variants: MINECRAFT_V2_TYPES.flatMap((type, typeIdx) =>
    MINECRAFT_V2_SIZES.map((size, sizeIdx) => {
      const stock = MINECRAFT_V2_INVENTORY[type]?.[size] ?? 0;

      return {
        id: `var-minecraft-v2-${typeIdx}-${sizeIdx}`,
        title: `${type} / ${size}`,
        price: {
          amount: '310000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: MINECRAFT_V2_DESCRIPTION,
        selectedOptions: [
          { name: 'Loại', value: type },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789357846/708993192_4531062430456464_2318675204886956361_n.jpg',
    altText: 'Sục Minecraft V2 Đèn Trẻ Em'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789357846/708993192_4531062430456464_2318675204886956361_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789357846/707796174_4531062437123130_5659656041026334861_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789357846/707463902_4531062473789793_8044043319094062164_n.jpg'
  ]
},
{
  id: '16',
  handle: 'suc-mickey-cuoi',
  title: 'Sục Mickey Cười Chuẩn Xuất Xịn',
  description: MICKEY_SMILE_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-tre-em',
  priceRange: {
    minVariantPrice: { amount: '299000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '299000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-type-mickey-smile',
      name: 'Loại',
      values: MICKEY_SMILE_TYPES
    },
    {
      id: 'opt-size-mickey-smile',
      name: 'Size',
      values: MICKEY_SMILE_SIZES
    }
  ],
  variants: MICKEY_SMILE_TYPES.flatMap((type, typeIdx) =>
    MICKEY_SMILE_SIZES.map((size, sizeIdx) => {
      const stock = MICKEY_SMILE_INVENTORY[type]?.[size] ?? 0;

      return {
        id: `var-mickey-smile-${typeIdx}-${sizeIdx}`,
        title: `${type} / ${size}`,
        price: {
          amount: '299000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: MICKEY_SMILE_DESCRIPTION,
        selectedOptions: [
          { name: 'Loại', value: type },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789359902/753320217_4594781054084601_7263347542966850605_n.jpg',
    altText: 'Sục Mickey Cười Chuẩn Xuất Xịn'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789359902/753320217_4594781054084601_7263347542966850605_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789359902/753169668_4594781080751265_8584259473844710905_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789359903/753531258_4594781067417933_264292991387845719_n.jpg'
  ]
},
{
  id: '17',
  handle: 'dep-quai-ngang-echo-slide',
  title: 'Dép Quai Ngang Echo Slide',
  description: ECHO_SLIDE_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-unisex',
  priceRange: {
    minVariantPrice: { amount: '350000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '350000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-echo-slide',
      name: 'Màu sắc',
      values: ECHO_SLIDE_COLORS
    },
    {
      id: 'opt-size-echo-slide',
      name: 'Size',
      values: ECHO_SLIDE_SIZES
    }
  ],
  variants: ECHO_SLIDE_COLORS.flatMap((color, colorIdx) =>
    ECHO_SLIDE_SIZES.map((size, sizeIdx) => {
      const stock = ECHO_SLIDE_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-echo-slide-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '350000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: ECHO_SLIDE_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360544/777824923_4622938151268891_7624283679560110810_n.jpg',
    altText: 'Dép Quai Ngang Echo Slide'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360544/777824923_4622938151268891_7624283679560110810_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360545/778025937_4622938291268877_1500308041561871512_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360520/777801266_4622938271268879_6958107208756710976_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360514/776444539_4622938277935545_1394333242187997195_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360514/777800929_4622938157935557_8641529069426591973_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789360514/777766719_4622938297935543_4752696302233048989_n.jpg'
  ]
},
{
  id: '18',
  handle: 'suc-hoa-lan-fancy-crocs-xuat-xin',
  title: 'Sục Hoa Lan Fancy Crocs Xuất Xịn',
  description: HOA_LAN_FANCY_DESCRIPTION,
  type: 'co-san',
  category: 'crocs-nu',
  priceRange: {
    minVariantPrice: { amount: '385000', currencyCode: 'VND' },
    maxVariantPrice: { amount: '385000', currencyCode: 'VND' }
  },
  options: [
    {
      id: 'opt-color-hoa-lan-fancy',
      name: 'Màu sắc',
      values: HOA_LAN_FANCY_COLORS
    },
    {
      id: 'opt-size-hoa-lan-fancy',
      name: 'Size',
      values: HOA_LAN_FANCY_SIZES
    }
  ],
  variants: HOA_LAN_FANCY_COLORS.flatMap((color, colorIdx) =>
    HOA_LAN_FANCY_SIZES.map((size, sizeIdx) => {
      const stock = HOA_LAN_FANCY_INVENTORY[color]?.[size] ?? 0;

      return {
        id: `var-hoa-lan-fancy-${colorIdx}-${sizeIdx}`,
        title: `${color} / ${size}`,
        price: {
          amount: '385000',
          currencyCode: 'VND'
        },
        availableForSale: stock > 0,
        quantityAvailable: stock,
        description: HOA_LAN_FANCY_DESCRIPTION,
        selectedOptions: [
          { name: 'Màu sắc', value: color },
          { name: 'Size', value: size }
        ]
      };
    })
  ),
  featuredImage: {
    url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379054/748330913_4586261008269939_8985326472312838736_n.jpg',
    altText: 'Sục Hoa Lan Fancy Crocs Xuất Xịn'
  },
  images: [
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379054/748330913_4586261008269939_8985326472312838736_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379054/747820010_4586261044936602_7825876296202570066_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379054/748541383_4586261051603268_4779558785913793030_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379054/748948219_4586261021603271_8840079415512871174_n.jpg',
    'https://res.cloudinary.com/dpsejpp2/image/upload/v1789379055/749259029_4586260984936608_4453225582061986798_n.jpg'
  ]
}
];