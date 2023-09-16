import React from "react";
import { Pagination } from "@carbon/react";
import { useLayoutType } from "@openmrs/esm-framework";
import { usePaginationInfo } from "./usePaginationInfo";
import styles from "./pagination.scss";

interface FormBuilderPaginationProps {
  currentItems: number;
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  onPageNumberChange?: ({ page }: { page: number }) => void;
}

export const FormBuilderPagination: React.FC<FormBuilderPaginationProps> = ({
  totalItems,
  pageSize,
  onPageNumberChange,
  pageNumber,
  currentItems,
}) => {
  const { itemsDisplayed, pageSizes } = usePaginationInfo(
    pageSize,
    totalItems,
    pageNumber,
    currentItems,
  );
  const isTablet = useLayoutType() === "tablet";

  return (
    <>
      {totalItems > 0 && (
        <div className={isTablet ? styles.tablet : styles.desktop}>
          <div>{itemsDisplayed}</div>
          <Pagination
            className={styles.pagination}
            page={pageNumber}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={totalItems}
            onChange={onPageNumberChange}
            size={isTablet ? "lg" : "sm"}
          />
        </div>
      )}
    </>
  );
};
