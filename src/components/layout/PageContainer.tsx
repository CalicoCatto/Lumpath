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
      className={`min-h-full ${noPadding ? '' : 'px-4 pt-4'} ${
        noBottomPadding ? '' : 'pb-20'
      } hide-scrollbar`}
    >
      {title && (
        <h1 className="text-xl font-bold text-stone-800 mb-4">{title}</h1>
      )}
      {children}
    </div>
  );
}
