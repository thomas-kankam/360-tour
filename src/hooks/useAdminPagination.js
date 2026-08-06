import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SERVER_PAGE_SIZE,
  mapServerPagination,
  paginateLocalItems,
  parsePaginatedList,
} from "../utils/adminPaginationHelpers";

export const ADMIN_TABLE_PAGE_SIZE = DEFAULT_SERVER_PAGE_SIZE;

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useAdminPagination(items, { pageSize = ADMIN_TABLE_PAGE_SIZE, resetKey } = {}) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return {
    page,
    setPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    rangeStart,
    rangeEnd,
    hasPagination: totalItems > pageSize,
  };
}

export function useServerAdminPagination({ pageSize = DEFAULT_SERVER_PAGE_SIZE, resetKey } = {}) {
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    totalItems: 0,
    totalPages: 1,
    rangeStart: 0,
    rangeEnd: 0,
    hasPagination: false,
  });

  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const syncFromResponse = useCallback(
    (data, requestedPage) => {
      const currentPage = requestedPage ?? pageRef.current;
      const { items, pagination } = parsePaginatedList(data);
      const nextMeta = mapServerPagination(pagination, { page: currentPage, pageSize });

      if (nextMeta.totalPages > 0 && currentPage > nextMeta.totalPages) {
        setPage(nextMeta.totalPages);
        return { items, meta: nextMeta, shouldRefetch: true };
      }

      setMeta((prev) => {
        if (
          prev.totalItems === nextMeta.totalItems &&
          prev.totalPages === nextMeta.totalPages &&
          prev.rangeStart === nextMeta.rangeStart &&
          prev.rangeEnd === nextMeta.rangeEnd &&
          prev.hasPagination === nextMeta.hasPagination
        ) {
          return prev;
        }
        return nextMeta;
      });

      return { items, meta: nextMeta, shouldRefetch: false };
    },
    [pageSize]
  );

  return useMemo(
    () => ({
      page,
      setPage,
      pageSize,
      ...meta,
      syncFromResponse,
    }),
    [page, pageSize, meta, syncFromResponse]
  );
}

export function useLocalAdminPagination(items, { pageSize = DEFAULT_SERVER_PAGE_SIZE, resetKey } = {}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const { items: paginatedItems, pagination } = useMemo(
    () => paginateLocalItems(items, page, pageSize),
    [items, page, pageSize]
  );

  const meta = useMemo(() => mapServerPagination(pagination, { page, pageSize }), [pagination, page, pageSize]);

  useEffect(() => {
    if (page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [page, meta.totalPages]);

  return {
    page,
    setPage,
    pageSize,
    paginatedItems,
    totalItems: meta.totalItems,
    totalPages: meta.totalPages,
    rangeStart: meta.rangeStart,
    rangeEnd: meta.rangeEnd,
    hasPagination: meta.hasPagination,
  };
}

function buildVisiblePages(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function getAdminPaginationPages(current, total) {
  const visible = buildVisiblePages(current, total);
  const items = [];

  visible.forEach((p, index) => {
    if (index > 0 && p - visible[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(p);
  });

  return items;
}
