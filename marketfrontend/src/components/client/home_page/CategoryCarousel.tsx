"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import styles from "./CategoryCarousel.module.css";

type CategoryItem = {
  id: number | string;
  category_name: string;
  category_icon?: string;
};

type Props = {
  categories: CategoryItem[];
};

const getItemsPerPage = (width: number) => {
  if (width >= 1200) return 20;
  if (width >= 992) return 12;
  if (width >= 768) return 8;
  if (width >= 480) return 6;
  return 4;
};

export default function CategoryCarousel({ categories }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    startX: 0,
    deltaX: 0,
  });

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(getItemsPerPage(window.innerWidth));
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const columnsPerPage = Math.max(1, Math.ceil(itemsPerPage / 2));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages - 1));
  }, [totalPages]);

  const maxStartIndex = Math.max(0, categories.length - itemsPerPage);
  const startIndex = Math.min(currentPage * itemsPerPage, maxStartIndex);
  const visibleCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goPrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const goNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current.startX = event.clientX;
    dragState.current.deltaX = 0;
    setIsDragging(false);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.startX === 0) return;

    dragState.current.deltaX = event.clientX - dragState.current.startX;

    if (Math.abs(dragState.current.deltaX) > 8) {
      setIsDragging(true);
    }
  };

  const handlePointerEnd = () => {
    const threshold = 50;
    const { deltaX } = dragState.current;

    if (Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) goNext();
      else goPrev();
    }

    dragState.current.startX = 0;
    dragState.current.deltaX = 0;

    window.setTimeout(() => {
      setIsDragging(false);
    }, 0);
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.navButton}
        onClick={goPrev}
        disabled={currentPage === 0}
        aria-label="Danh mục trước"
      >
        ‹
      </button>

      <div className={styles.viewport}>
        <div
          key={startIndex}
          className={styles.grid}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={
            {
              "--category-columns": columnsPerPage,
            } as CSSProperties
          }
        >
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`${styles.categoryCard} ${isDragging ? styles.draggingCard : ""}`}
              draggable={false}
            >
              <div className={styles.categoryIconWrap}>
                {cat.category_icon && (
                  <img
                    src={cat.category_icon}
                    alt={cat.category_name}
                    className={styles.categoryIcon}
                  />
                )}
              </div>
              <span className={styles.categoryName}>{cat.category_name}</span>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.navButton}
        onClick={goNext}
        disabled={currentPage >= totalPages - 1}
        aria-label="Danh mục tiếp theo"
      >
        ›
      </button>
    </div>
  );
}
