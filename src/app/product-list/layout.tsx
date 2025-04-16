import React from 'react';

export const metadata = {
  title: '상품 리스트 | 위버',
  description: '다양한 상품들을 탐색하고 검색해보세요. 리스트 뷰와 그리드 뷰로 자유롭게 볼 수 있습니다.',
};

export default function ProductListLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-nsBlue-100 to-nsBlue-100/60 bg-clip-text text-transparent">
            위버 상품 리스트
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-2">
            다양한 상품들을 탐색하고 검색해보세요. 리스트 뷰와 그리드 뷰로 자유롭게 볼 수 있습니다.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
