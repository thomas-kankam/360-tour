export const DEFAULT_SERVER_PAGE_SIZE = 15;

const EMPTY_META = {
  totalItems: 0,
  totalPages: 1,
  rangeStart: 0,
  rangeEnd: 0,
  hasPagination: false,
};

export function parsePaginatedList(data) {
  if (Array.isArray(data)) {
    return { items: data, pagination: null };
  }

  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      pagination: data.pagination ?? null,
    };
  }

  return { items: [], pagination: null };
}

export function mapServerPagination(pagination, { page, pageSize = DEFAULT_SERVER_PAGE_SIZE } = {}) {
  if (!pagination) {
    return { ...EMPTY_META, page: page ?? 1, pageSize };
  }

  const currentPage = pagination.current_page ?? page ?? 1;
  const perPage = pagination.per_page ?? pageSize;
  const total = pagination.total ?? 0;
  const lastPage = Math.max(1, pagination.last_page ?? (Math.ceil(total / perPage) || 1));
  const from = pagination.from ?? (total === 0 ? 0 : (currentPage - 1) * perPage + 1);
  const to = pagination.to ?? Math.min(currentPage * perPage, total);

  return {
    page: currentPage,
    pageSize: perPage,
    totalItems: total,
    totalPages: lastPage,
    rangeStart: from,
    rangeEnd: to,
    hasPagination: lastPage > 1,
  };
}

export function paginateLocalItems(items, page, pageSize = DEFAULT_SERVER_PAGE_SIZE) {
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return {
    items: items.slice(start, end),
    pagination: {
      current_page: currentPage,
      per_page: pageSize,
      total,
      last_page: lastPage,
      from: total === 0 ? 0 : start + 1,
      to: end,
    },
  };
}

export function buildListQueryParams({
  page = 1,
  per_page = DEFAULT_SERVER_PAGE_SIZE,
  search,
  status,
  payment_status,
  payment_method,
  is_verified,
} = {}) {
  return {
    page,
    per_page,
    ...(search?.trim() ? { search: search.trim() } : {}),
    ...(status ? { status } : {}),
    ...(payment_status ? { payment_status } : {}),
    ...(payment_method ? { payment_method } : {}),
    ...(is_verified !== undefined && is_verified !== null ? { is_verified } : {}),
  };
}
