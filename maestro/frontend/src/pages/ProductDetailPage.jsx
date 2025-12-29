import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext.jsx';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setError('');
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить товар');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, 1);
    setAddedMessage('Товар добавлен в корзину');
    setTimeout(() => setAddedMessage(''), 2000);
  }

  if (loading) return <div>Загрузка товара...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="max-h-64 max-w-full object-contain"
              />
            ) : (
              <span className="text-textSecondary text-sm">
                Нет изображения
              </span>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <div className="text-primary text-xl font-bold mb-2">
            {product.price} Kč
          </div>
          <div className="text-sm text-textSecondary mb-4">
            Категория: {product.category || 'Без категории'}
          </div>
          <p className="text-sm mb-4 whitespace-pre-line">
            {product.description || 'Описание отсутствует'}
          </p>

          {addedMessage && (
            <div className="text-xs text-green-600 mb-2">{addedMessage}</div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="px-4 py-2 rounded-md bg-accent text-white text-sm hover:opacity-90"
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
