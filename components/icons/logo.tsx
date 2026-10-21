import clsx from 'clsx';

export default function LogoIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo"
      viewBox="0 0 100 100"
      {...props}
      className={clsx(
        'h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-white p-0.5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900',
        props.className
      )}
    >
      <image
        href="/icons/icon-192.png"
        x="-5"
        y="-5"
        height="110"
        width="110"
        preserveAspectRatio="none"
      />
    </svg>
  );
}