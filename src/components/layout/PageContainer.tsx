import type { ReactNode } from 'react';

interface Props {
  title?: string;
  children: ReactNode;
  noPadding?: boolean;
  noBottomPadding?: boolean;
}

export default function PageContainer({ title, children, noPadding, noBottomPadding }: Props) {
  return (
    <div
      className={`min-h-full ${noPadding ? '' : 'px-4 md:px-8 lg:px-12 pt-4 md:pt-6'} ${
        noBottomPadding ? '' : 'pb-20 md:pb-8'
      } hide-scrollbar md:max-w-4xl md:mx-auto`}
    >
      {title && (
        <h1 className="text-xl md:text-2xl font-bold text-stone-800 mb-4 md:mb-6">{title}</h1>
      )}
      {children}
    </div>
  );
}
