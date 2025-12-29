import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('/products');
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div>Загрузка товаров...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (!products.length) {
    return <div>Пока нет ни одного товара.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Каталог товаров</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/products/${p._id}`}
            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="h-32 mb-3 bg-gray-100 flex items-center justify-center text-sm text-textSecondary">
              {p.images && p.images.length > 0 ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="max-h-32 max-w-full object-contain"
                />
              ) : (
                'Нет изображения'
              )}
            </div>
            <h2 className="font-medium mb-1 line-clamp-2">{p.name}</h2>
            <div className="text-primary font-semibold mb-1">
              {p.price} Kč
            </div>
            <div className="text-xs text-textSecondary">
              {p.category || 'Без категории'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProductListPage;
