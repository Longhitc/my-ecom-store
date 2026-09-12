import { mockProducts } from "app/product/products"; // Import chính xác biến mockProducts
import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default function SearchPage() {
  return (
    <section>
      <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <ProductGridItems products={mockProducts as any} />
      </Grid>
    </section>
  );
}