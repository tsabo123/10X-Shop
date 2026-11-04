import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getProduct, getProducts } from '../services/products';
import { getLocalReviews, saveLocalReview } from '../services/reviews';
import { useAuth, useCart } from '../contexts';
import type { Product, ProductReview } from '../types';
import { isApiError } from '../services/api';
import { money, ProductCard, salePrice, PageNotFound } from '../ui/shared';
import { useToast } from '../ui/Toast';
export default function ProductPage() {
  const {
    id = ''
  } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [reviewErrors, setReviewErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const {
    add
  } = useCart();
  const {
    user
  } = useAuth();
  const {
    show
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (!Number.isInteger(productId) || productId < 1) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getProduct(productId, controller.signal).then(value => {
      setProduct(value);
      setSelectedImage(value.images[0] ?? value.thumbnail);
      setLocalReviews(getLocalReviews(value.id));
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(isApiError(reason) && reason.status === 404 ? 'not-found' : reason instanceof Error ? reason.message : 'Could not load this product.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [productId, retry]);
  useEffect(() => {
    if (!product) return;
    const controller = new AbortController();
    getProducts({
      category: product.category,
      limit: 5,
      signal: controller.signal
    }).then(response => setRelated(response.products.filter(item => item.id !== product.id).slice(0, 4))).catch(() => {
      if (!controller.signal.aborted) setRelated([]);
    });
    return () => controller.abort();
  }, [product]);
  const reviews = useMemo(() => [...localReviews, ...(product?.reviews ?? [])], [localReviews, product]);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product?.rating ?? 0;
  if (!Number.isInteger(productId) || productId < 1 || error === 'not-found') return <PageNotFound />;
  if (loading) return <div className="status wrap">Loading product…</div>;
  if (error) return <div className="status error wrap">{error} <button onClick={() => setRetry(value => value + 1)}>Retry</button></div>;
  if (!product) return <PageNotFound />;
  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: {
      rating?: string;
      comment?: string;
    } = {};
    if (!rating) errors.rating = 'Please select a rating';
    if (comment.trim().length < 10) errors.comment = 'Comment must be at least 10 characters';
    setReviewErrors(errors);
    if (Object.keys(errors).length) return;
    const review: ProductReview = {
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date().toISOString(),
      reviewerName: user ? `${user.firstName} ${user.lastName}` : 'Guest'
    };
    saveLocalReview(product.id, review);
    setLocalReviews(current => [review, ...current]);
    setRating('');
    setComment('');
    setReviewErrors({});
    show('Review added ✓');
  };
  const addToCart = () => show(add(product, quantity) ? 'Added to cart ✓' : 'The requested quantity exceeds available stock.');
  return <main className="wrap detail"><div className="gallery"><img className="detail-image" src={selectedImage} alt={product.title} /><div className="gallery-thumbs">{(product.images.length ? product.images : [product.thumbnail]).map((image, index) => <button aria-label={`Show product photo ${index + 1}`} aria-pressed={selectedImage === image} key={`${image}-${index}`} onClick={() => setSelectedImage(image)}><img src={image} alt="" loading="lazy" width="80" height="80" /></button>)}</div></div>
    <div className="detail-copy"><Link className="back-link" to="/"> <ArrowLeft size={15} /> Back to catalog</Link><div className="eyebrow"><Link to={`/?category=${encodeURIComponent(product.category)}`}>{product.category.replaceAll('-', ' ')}</Link> · {product.brand ?? '10X Shop'}</div><h1>{product.title}</h1><div className="detail-price">{money(salePrice(product))} {product.discountPercentage > 0 && <><del>{money(product.price)}</del><span>−{product.discountPercentage.toFixed(0)}%</span></>}</div><p className="rating-line">★ {average.toFixed(1)} · {reviews.length} reviews</p><p className={`stock-label ${product.stock <= 5 ? 'low-stock' : ''}`}>{product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In stock'}</p><div className="buy-row"><div className="quantity"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)}>−</button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= product.stock} onClick={() => setQuantity(value => Math.min(product.stock, value + 1))}>+</button></div><button className="button dark-button" disabled={!product.stock} onClick={addToCart}>Add to cart — {money(salePrice(product) * quantity)}</button></div><div className="detail-note">Easy returns within 30 days · Free shipping over $100</div>
      <div className="product-tabs" role="tablist" aria-label="Product information"><button role="tab" aria-selected={activeTab === 'description'} onClick={() => setActiveTab('description')}>Description</button><button role="tab" aria-selected={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</button></div>
      {activeTab === 'description' ? <section className="tab-content"><h2>About this find</h2><p>{product.description}</p></section> : <section className="reviews" role="tabpanel"><h2>Reviews <span>({reviews.length})</span></h2>{reviews.map((review, index) => <blockquote key={`${review.date}-${index}`}><b>{review.reviewerName} · {'★'.repeat(review.rating)} · {new Date(review.date).toLocaleDateString()}</b><p>{review.comment}</p></blockquote>)}<form className="review-form" onSubmit={submitReview}><h3>Write a review</h3><label htmlFor="review-rating">Rating</label><select id="review-rating" value={rating} onChange={event => setRating(event.target.value)}><option value="">Select rating</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} stars</option>)}</select>{reviewErrors.rating && <small className="error">{reviewErrors.rating}</small>}<label htmlFor="review-comment">Comment</label><textarea id="review-comment" value={comment} onChange={event => setComment(event.target.value)} rows={3} />{reviewErrors.comment && <small className="error">{reviewErrors.comment}</small>}<button className="button dark-button">Submit review</button></form></section>}
    </div>{related.length > 0 && <section className="related wrap"><div className="section-heading"><h2>You may also like</h2><button className="text-btn" onClick={() => navigate(`/products/${related[0].id}`)}>Explore picks <ArrowRight size={14} /></button></div><div className="product-grid">{related.map(item => <ProductCard key={item.id} product={item} />)}</div></section>}</main>;
}
