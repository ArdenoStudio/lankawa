/** Pagination iterators for lab endpoints (ESM). */

export const LAB_ENDPOINTS = [];

const CEB_GROUPS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

function asList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object") {
    for (const key of ["data", "items", "results", "content", "features", "clusters", "reqTradeSummaryList", "offers", "records", "rows"]) {
      if (Array.isArray(raw[key])) return raw[key];
    }
    return [raw];
  }
  return [raw];
}

export async function* iterPages(fetchPage, options = {}) {
  const style = (options.style || "page_limit").toLowerCase();
  const start = options.start ?? 1;
  const maxPages = options.maxPages ?? 50;
  const pageSize = options.pageSize ?? 50;

  if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style)) {
    const raw = await fetchPage();
    const items = asList(raw);
    if (items.length === 0) {
      yield { page: 0, offset: 0, limit: pageSize, items: [], raw, done: true };
      return;
    }
    for (let i = 0; i < items.length; i += pageSize) {
      const chunk = items.slice(i, i + pageSize);
      const page = Math.floor(i / pageSize);
      yield { page, offset: i, limit: pageSize, items: chunk, raw: page === 0 ? raw : chunk, done: i + pageSize >= items.length };
    }
    return;
  }

  if (style === "group_id") {
    const groups = CEB_GROUPS.slice(0, maxPages);
    for (let idx = 0; idx < groups.length; idx++) {
      const group = groups[idx];
      const raw = await fetchPage(group);
      const items = asList(raw);
      yield { page: idx, offset: idx, limit: 1, key: group, items, raw, done: idx === groups.length - 1 };
    }
    return;
  }

  for (let i = 0; i < maxPages; i++) {
    let page = start + i;
    let offset = (page - 1) * pageSize;
    let key = String(page);
    let raw;
    if (style === "arcgis") {
      offset = (start > 0 ? start : 0) + i * pageSize;
      page = i;
      key = String(offset);
      raw = await fetchPage(offset, pageSize);
    } else if (style === "pagerequest") {
      const index = (start >= 0 ? start : 0) + i;
      page = index;
      offset = index * pageSize;
      key = String(index);
      raw = await fetchPage(index, pageSize);
    } else {
      raw = await fetchPage(page, pageSize);
    }
    const items = asList(raw);
    const empty = items.length === 0;
    yield { page, offset, limit: pageSize, key, items, raw, done: empty };
    if (empty) break;
    if ((style === "arcgis" || style === "pagerequest") && items.length < pageSize) break;
  }
}

export async function* iterLabEndpoint(client, endpointId, options = {}) {
  const meta = LAB_ENDPOINTS.find((m) => m.id === endpointId);
  if (!meta) throw new Error(`No lab endpoint ${endpointId} for nwsdb-bill-api-docs`);
  const fn = client[meta.method].bind(client);
  const style = meta.style;
  const fetchPage = async (...args) => {
    if (style.toLowerCase() === "group_id") return fn(args[0] ?? "A");
    if (["client_slice", "full_download", "client_array", "html_list", "multi_host", "time_window"].includes(style.toLowerCase())) {
      return fn();
    }
    if (args.length >= 2) return fn(args[0], args[1]);
    return fn();
  };
  yield* iterPages(fetchPage, { style, ...options });
}
