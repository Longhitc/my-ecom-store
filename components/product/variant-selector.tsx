'use client';

import { ProductOption, ProductVariant } from 'lib/shopify/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface VariantSelectorProps {
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export function VariantSelector({ options, variants }: VariantSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Kiểm tra an toàn: Nếu sản phẩm không có options/variants thì không render gì cả
  if (!options || options.length === 0) {
    return null;
  }

  const handleSelect = (optionName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(optionName.toLowerCase(), value);
    
    // Cập nhật URL mà không reload lại trang
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      {options.map((option) => {
        const optionKey = option.name.toLowerCase();
        const currentValue = searchParams.get(optionKey) || option.values[0];

        return (
          <div key={option.id} className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {option.name}
            </label>
            
            <div className="relative w-full max-w-xs">
              <select
                className="w-full appearance-none rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                onChange={(e) => handleSelect(option.name, e.target.value)}
                value={currentValue}
              >
                {option.values.map((value: string) => (
                  <option key={value} value={value} className="bg-neutral-900 text-white py-1">
                    {value}
                  </option>
                ))}
              </select>
              
              {/* Mũi tên góc phải dropdown */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}