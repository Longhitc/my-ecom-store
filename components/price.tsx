
const Price = ({
  amount,
  className,
  currencyCode = 'VND',
  currencyCodeClassName
}: {
  amount: string;
  className?: string;
  currencyCode?: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<'p'>) => {

  // 1. Format số có dấu phẩy/chấm phân cách hàng nghìn (ví dụ: 360,000)
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(parseFloat(amount));

  return (
    <p suppressHydrationWarning className={className}>
      {/* 2. Hiển thị số trước, chữ "đ" ở đằng sau */}
      {`${formattedAmount} đ`}
    </p>
  );
};

export default Price;
