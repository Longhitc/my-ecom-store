import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

// export default async function SearchPage(props: {
//   searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
// }) {
//   const searchParams = await props.searchParams;
//   const { sort, q: searchValue } = searchParams as { [key: string]: string };
//   const { sortKey, reverse } =
//     sorting.find((item) => item.slug === sort) || defaultSort;

  //const products = await getProducts({ sortKey, reverse, query: searchValue });

  // Dữ liệu mẫu sản phẩm
  const mockProducts = [
  {
    id: '1',
    handle: 'leather-bag',
    title: 'Túi đeo da',
    description: 'Túi da phong cách',
    priceRange: { maxVariantPrice: { amount: '360000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590887/samples/ecommerce/leather-bag-gray.jpg', // Dùng link ảnh sạch
      altText: 'Bag'
    }
  },
  {
    id: '2',
    handle: 'acme-circles-t-shirt',
    title: 'Giày thể thao',
    description: 'Giày họa tiết',
    priceRange: { maxVariantPrice: { amount: '220000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590885/samples/ecommerce/shoes.png',
      altText: 'T-Shoes'
    }
  },
  {
    id: '3',
    handle: 'acme-mug',
    title: 'Ly sứ',
    description: 'Ly sứ giữ nhiệt',
    priceRange: { maxVariantPrice: { amount: '85000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786590894/samples/cup-on-a-table.jpg',
      altText: 'Cup'
    }
  },
  // --- DÒNG 2 (Thêm mới vào đây) ---
  {
    id: '4',
    handle: 'acme-tshirt',
    title: 'Giày Crocks Tím',
    description: 'Áo thun thời trang',
    priceRange: { maxVariantPrice: { amount: '250000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/766aa432919310cd4982.jpg', // Tạm thời dùng lại ảnh giày hoặc ảnh bạn thích
      altText: 'T-Shirt'
    }
  },
  {
    id: '5',
    handle: 'acme-hat-2',
    title: 'Dép Crocks xỏ ngón',
    description: 'Mũ len ấm áp',
    priceRange: { maxVariantPrice: { amount: '170000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1786594570/b5c5d1d2e473652d3c62.jpg',
      altText: 'Hat 2'
    }
  },
  {
    id: '6',
    handle: 'acme-mug-2',
    title: 'Giày Crocks Mickey',
    description: 'Ly sứ cao cấp',
    priceRange: { maxVariantPrice: { amount: '180000', currencyCode: 'VND' } },
    featuredImage: {
      url: 'https://res.cloudinary.com/dpsejpp2/image/upload/v1788776944/607ab6bab5f535ab6ce4.jpg',
      altText: 'Mug 2'
    }
  }
];

  

  export default function SearchPage() {
    return (
      <section>
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={mockProducts as any} />
        </Grid>
      </section>
    );
  }
  // Gán đè dữ liệu ảo vào biến products của trang
const products = mockProducts;
  const resultsText = products.length > 1 ? "results" : "result";

//   return (
//     <>
//       {searchValue ? (
//         <p className="mb-4">
//           {products.length === 0
//             ? "There are no products that match "
//             : `Showing ${products.length} ${resultsText} for `}
//           <span className="font-bold">&quot;{searchValue}&quot;</span>
//         </p>
//       ) : null}
//       {products.length > 0 ? (
//         <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           <ProductGridItems products={products} />
//         </Grid>
//       ) : null}
//     </>
//   );
// }
