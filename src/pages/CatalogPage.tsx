import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { getCategories, getProducts } from '../services/products';
import type { AsyncState, Category, Product, SortOption } from '../types';
import { ProductCard } from '../ui/shared';
import { useDebounce } from '../hooks/useDebounce';
function getPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({
    length: total
  }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'ellipsis', total];
  if (current >= total - 3) return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}
function isSortOption(value: string | null): value is SortOption {
  return value === '' || value === 'price-asc' || value === 'price-desc' || value === 'rating-desc' || value === 'title-asc';
}
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const rawSort = params.get('sort');
  const sort: SortOption = isSortOption(rawSort) ? rawSort : '';
  const rawPage = Number(params.get('page') ?? 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [searchDraft, setSearchDraft] = useState(query);
  const debouncedSearch = useDebounce(searchDraft, 400);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMessage, setCategoryMessage] = useState('');
  const [result, setResult] = useState<AsyncState<{
    products: Product[];
    total: number;
  }>>({
    status: 'loading'
  });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setSearchDraft(query);
  }, [query]);
  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(setCategories).catch((error: unknown) => {
      if (!controller.signal.aborted) setCategoryMessage(error instanceof Error ? error.message : 'Categories could not be loaded.');
    });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setResult({
      status: 'loading'
    });
    getProducts({
      limit: 12,
      skip: (page - 1) * 12,
      search: query,
      category,
      sort,
      signal: controller.signal
    }).then(data => setResult({
      status: 'success',
      data
    })).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Products could not be loaded.'
      });
    });
    return () => controller.abort();
  }, [query, category, sort, page, retry]);
  // A request cleanup is tied to the current URL values, so a late page cannot replace newer results.
  const updateParams = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) value ? next.set(key, value) : next.delete(key);
    setParams(next);
  }, [params, setParams]);
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== query) updateParams({
      q: trimmed || null,
      category: null,
      page: '1'
    });
  }, [debouncedSearch, query, updateParams]);
  const chooseCategory = (value: string) => updateParams({
    category: value || null,
    q: null,
    page: '1'
  });
  const chooseSort = (value: SortOption) => updateParams({
    sort: value || null,
    page: '1'
  });
  const pageCount = result.status === 'success' ? Math.ceil(result.data.total / 12) : 0;
  const changePage = (value: number) => {
    updateParams({
      page: String(value)
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <main className="catalog-page">
    <section className="hero"><div className="hero-content"><div className="eyebrow">THE EVERYDAY EDIT · VOL. 01</div><h1>Find your<br /><em>good thing.</em></h1><p>Little upgrades, feel-good favourites, and things you didn’t know you needed.</p><a href="#catalog" className="button dark-button">Shop the collection <ArrowRight size={17} /></a></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=85" alt="Everyday essentials arranged together" /></div><span className="hero-note">THE LITTLE THINGS, DONE WELL.</span></section>
    <section className="wrap catalog mx-auto" id="catalog"><div className="section-heading"><div><div className="eyebrow">CURATED FOR YOU</div><h2>Catalog</h2></div><span className="muted">{result.status === 'success' ? `${result.data.total} thoughtfully picked finds · 12 per page` : '12 products per page'}</span></div>
      <div className="filters"><label className="search"><Search size={18} /><input aria-label="Search products" value={searchDraft} onChange={event => setSearchDraft(event.target.value)} placeholder="Search something lovely…" /></label><label className="sr-only" htmlFor="category">Category</label><select id="category" value={category} onChange={event => chooseCategory(event.target.value)}><option value="">All categories</option>{categories.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><label className="sr-only" htmlFor="sort">Sort products</label><select id="sort" value={sort} onChange={event => chooseSort(event.target.value as SortOption)}><option value="">Default</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating-desc">Rating: high to low</option><option value="title-asc">Name A to Z</option></select></div>
      {categoryMessage && <small className="error">{categoryMessage}</small>}
      {result.status === 'loading' && <div className="status">Gathering 12 finds…</div>}
      {result.status === 'error' && <div className="status error">{result.message} <button onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
      {result.status === 'success' && (result.data.products.length ? <><div className="product-grid grid grid-cols-2 md:grid-cols-4">{result.data.products.map(product => <ProductCard key={product.id} product={product} />)}</div>{pageCount > 0 && <div className="pagination" aria-label="Product pages"><button aria-label="Previous page" disabled={page === 1} onClick={() => changePage(page - 1)}>‹</button>{getPageNumbers(page, pageCount).map((value, index) => value === 'ellipsis' ? <span key={`ellipsis-${index}`}>…</span> : <button key={value} aria-current={page === value ? 'page' : undefined} onClick={() => changePage(value)}>{value}</button>)}<button aria-label="Next page" disabled={page >= pageCount} onClick={() => changePage(page + 1)}>›</button><span>Showing {result.data.total ? (page - 1) * 12 + 1 : 0}–{Math.min(page * 12, result.data.total)} of {result.data.total}</span></div>}</> : <div className="status">No products found. <button onClick={() => {
          setSearchDraft('');
          setParams(new URLSearchParams());
        }}>Clear filters</button></div>)}
    </section><section className="promo-band bg-shop-sage"><div className="eyebrow">A LITTLE THANK YOU</div><h2>Good things come in tens.</h2><p>Take 10% off your first order with code <b>10X10</b></p><Link to="/cart">Shop now <ArrowRight size={15} /></Link></section>
  </main>;
}
