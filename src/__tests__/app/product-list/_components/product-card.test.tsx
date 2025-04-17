import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import type { Product } from '@/api/products/types';
import ProductCard from '@/app/product-list/_components/product-card';

// Next.js Image 컴포넌트 모킹
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // fill, priority 등의 속성이 문자열로 변환되도록 수정
    const modifiedProps = { ...props };
    if (props.fill === true) modifiedProps.fill = 'true';
    if (props.fill === false) modifiedProps.fill = 'false';
    if (props.priority === true) modifiedProps.priority = 'true';
    if (props.priority === false) modifiedProps.priority = 'false';

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img data-testid="mock-image" {...modifiedProps} />;
  },
}));

describe('ProductCard 컴포넌트', () => {
  const mockProduct: Product = {
    id: 14,
    title: 'Knoll Saarinen Executive Conference Chair',
    description:
      'The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office or conference room with its timeless design.',
    price: 499.99,
    discountPercentage: 15.23,
    rating: 4.11,
    stock: 47,
    brand: 'Knoll',
    category: 'furniture',
    thumbnail:
      'https://cdn.dummyjson.com/products/images/furniture/Knoll%20Saarinen%20Executive%20Conference%20Chair/thumbnail.png',
    images: [
      'https://cdn.dummyjson.com/products/images/furniture/Knoll%20Saarinen%20Executive%20Conference%20Chair/1.png',
      'https://cdn.dummyjson.com/products/images/furniture/Knoll%20Saarinen%20Executive%20Conference%20Chair/2.png',
    ],
    tags: ['furniture', 'office chairs'],
    reviews: [
      {
        rating: 4,
        comment: 'Very happy with my purchase!',
        date: '2024-05-23T08:56:21.620Z',
        reviewerName: 'Leah Gutierrez',
        reviewerEmail: 'leah.gutierrez@x.dummyjson.com',
      },
      {
        rating: 4,
        comment: 'Would buy again!',
        date: '2024-05-23T08:56:21.620Z',
        reviewerName: 'Nolan Gonzalez',
        reviewerEmail: 'nolan.gonzalez@x.dummyjson.com',
      },
      {
        rating: 2,
        comment: 'Waste of money!',
        date: '2024-05-23T08:56:21.620Z',
        reviewerName: 'Stella Morris',
        reviewerEmail: 'stella.morris@x.dummyjson.com',
      },
    ],
  };

  // 각 테스트 이후 정리
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('상품 제목이 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const titleElement = screen.getByText('Knoll Saarinen Executive Conference Chair');
    expect(titleElement).toBeInTheDocument();
  });

  test('상품 설명이 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const descriptionElement = screen.getByText(
      'The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office or conference room with its timeless design.',
    );
    expect(descriptionElement).toBeInTheDocument();
  });

  test('할인된 가격이 올바르게 계산되어 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    // 499.99 * (1 - 15.23/100) = 약 424
    const priceElement = screen.getByLabelText('할인가: $424');
    expect(priceElement).toBeInTheDocument();
  });

  test('할인 전 가격이 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const originalPriceElement = screen.getByLabelText('원래 가격: $499.99');
    expect(originalPriceElement).toBeInTheDocument();
  });

  test('별점이 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const ratingElement = screen.getByText('4.11');
    expect(ratingElement).toBeInTheDocument();
  });

  test('리뷰 수가 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    // 리뷰 수는 텍스트가 나눠져 있을 수 있으므로 정규식 사용
    const reviewsElement = screen.getByText(/3개 리뷰/);
    expect(reviewsElement).toBeInTheDocument();
  });

  // 추가 테스트 케이스 - viewMode가 'grid'인 경우
  test('그리드 모드로 렌더링됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="grid" />);

    // 그리드 모드에서는 특정 클래스가 추가되는지 확인
    const articleElement = screen.getByRole('article');
    expect(articleElement).toHaveClass('hover:translate-y-[-4px]');
    expect(articleElement).not.toHaveClass('flex sm:flex-row');
  });

  // 할인율이 없는 상품 테스트
  test('할인율이 없는 상품은 할인 태그와 원래 가격을 표시하지 않습니다', () => {
    const productWithoutDiscount = {
      ...mockProduct,
      discountPercentage: 0,
    };

    render(<ProductCard product={productWithoutDiscount} viewMode="list" />);

    // 할인 태그가 없어야 함
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();

    // 원래 가격이 표시되지 않아야 함
    expect(screen.queryByLabelText(/원래 가격/)).not.toBeInTheDocument();
  });

  // 리뷰가 없는 상품 테스트
  test('리뷰가 없는 상품은 리뷰 수가 0으로 표시됩니다', () => {
    const productWithoutReviews = {
      ...mockProduct,
      reviews: [],
    };

    render(<ProductCard product={productWithoutReviews} viewMode="list" />);

    const reviewsElement = screen.getByText(/0개 리뷰/);
    expect(reviewsElement).toBeInTheDocument();
  });

  // 이미지 로딩 속성 테스트 - ID가 8 이하인 경우
  test('ID가 8 이하인 상품은 priority로 로드됩니다', () => {
    const priorityProduct = {
      ...mockProduct,
      id: 8,
    };

    render(<ProductCard product={priorityProduct} viewMode="list" />);

    const imageElement = screen.getByTestId('mock-image');
    expect(imageElement).toHaveAttribute('priority', 'true');
    expect(imageElement).not.toHaveAttribute('loading');
  });

  // 이미지 로딩 속성 테스트 - ID가 8보다 큰 경우
  test('ID가 8보다 큰 상품은 lazy 로딩됩니다', () => {
    // mockProduct의 ID는 이미 14로 8보다 큼
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const imageElement = screen.getByTestId('mock-image');
    expect(imageElement).toHaveAttribute('loading', 'lazy');
  });

  // 브랜드명이 표시되는지 테스트
  test('브랜드 이름이 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const brandElement = screen.getByText('Knoll');
    expect(brandElement).toBeInTheDocument();
  });

  // 할인율 라운딩 테스트
  test('할인율이 정수로 반올림되어 표시됩니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    // 15.23% → 15% 반올림
    const discountElement = screen.getByText('15% OFF');
    expect(discountElement).toBeInTheDocument();
  });

  // 이미지 alt 속성 테스트
  test('이미지의 alt 속성이 상품 제목을 사용합니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const imageElement = screen.getByTestId('mock-image');
    expect(imageElement).toHaveAttribute('alt', 'Knoll Saarinen Executive Conference Chair');
  });

  // aria-labelledby 속성 테스트
  test('상품 카드가 올바른 aria-labelledby 속성을 가집니다', () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    const articleElement = screen.getByRole('article');
    expect(articleElement).toHaveAttribute('aria-labelledby', 'product-title-14');
  });

  // 뷰 모드에 따른 이미지 sizes 속성 테스트
  test('이미지 sizes 속성이 뷰 모드에 따라 올바르게 설정됩니다', () => {
    // 그리드 모드 렌더링
    const { unmount: unmountGrid } = render(<ProductCard product={mockProduct} viewMode="grid" />);
    const gridImageElement = screen.getByTestId('mock-image');
    expect(gridImageElement).toHaveAttribute('sizes', '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw');

    // 그리드 모드 언마운트
    unmountGrid();

    // 리스트 모드 렌더링
    render(<ProductCard product={mockProduct} viewMode="list" />);
    const listImageElement = screen.getByTestId('mock-image');
    expect(listImageElement).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 33vw');
  });
});
