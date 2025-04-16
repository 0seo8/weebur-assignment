'use client';

import Image from 'next/image';

import type { Product } from '@/api/products/types';

interface ProductCardProps {
  product: Product;
  viewMode: 'list' | 'grid';
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  const isGridMode = viewMode === 'grid';

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(discountedPrice);

  const reviewCount = product.reviews?.length || 0;

  return (
    <article
      className={`rounded-xl border border-gray-100 overflow-hidden bg-white transition-all duration-200 hover:shadow-md ${
        isGridMode ? 'hover:translate-y-[-4px]' : 'flex sm:flex-row'
      }`}
      aria-labelledby={`product-title-${product.id}`}
    >
      <div
        className={`${isGridMode ? 'aspect-square' : 'w-full sm:w-1/3 h-48 sm:h-auto'} relative overflow-hidden group`}
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes={
            isGridMode ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw' : '(max-width: 640px) 100vw, 33vw'
          }
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          priority={product.id <= 8}
          loading={product.id > 8 ? 'lazy' : undefined}
        />
        <div className="absolute top-3 left-3">
          {product.discountPercentage > 0 && (
            <span className="bg-rose-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {Math.round(product.discountPercentage)}% OFF
            </span>
          )}
        </div>
      </div>
      <div className={`p-5 ${isGridMode ? '' : 'flex-1'}`}>
        <div className="text-xs font-medium text-gray-400 mb-1">{product.brand}</div>
        <h2 id={`product-title-${product.id}`} className="font-bold text-xl mb-1 text-gray-800 truncate">
          {product.title}
        </h2>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-amber-400 mr-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="text-gray-600 font-medium">{product.rating}</span>
            <span className="text-gray-400 text-xs ml-1">({reviewCount}개 리뷰)</span>
          </div>
          <div>
            {product.discountPercentage > 0 && (
              <span className="text-gray-400 text-sm line-through mr-2" aria-label={`원래 가격: $${product.price}`}>
                ${product.price}
              </span>
            )}
            <span className="text-gray-800 font-bold text-lg" aria-label={`할인가: ${formattedPrice}`}>
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
