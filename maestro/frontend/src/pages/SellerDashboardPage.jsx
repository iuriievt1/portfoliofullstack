import { useEffect, useState } from 'react';
import api from '../api/client';

function SellerDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState('');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('maestro_token')
    : null;

  async function loadMyProducts() {
    if (!token) {
      setErrorList('Нужно войти как продавец, чтобы увидеть кабинет.');
      setLoadingList(false);
      return;
    }

    try {
      setErrorList('');
      setLoadingList(true);
      const res = await api.get('/products/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      setErrorList(
        err.response?.data?.message || 'Не удалось загрузить товары продавца'
      );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadMyProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateProduct(e) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!token) {
      setCreateError('Нужно войти как продавец.');
      return;
    }

    if (!name || !price) {
      setCreateError('Название и цена обязательны');
      return;
    }

    const body = {
      name,
      description,
      price: Number(price),
      category,
      images: imageUrl ? [imageUrl] : [],
      type: 'physical',
      stock_quantity: 0,
    };

    try {
      setCreating(true);
      const res = await api.post('/products', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCreateSuccess('Товар создан');
      setName('');
      setPrice('');
      setCategory('');
      setImageUrl('');
      setDescription('');

      // добавить в список или перезагрузить
      setProducts((prev) => [res.data.product, ...prev]);
    } catch (err) {
      console.error(err);
      setCreateError(
        err.response?.data?.message || 'Ошибка при создании товара'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!token) return;
    const ok = window.confirm('Удалить этот товар?');
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || 'Не удалось удалить товар'
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Кабинет продавца</h1>

      {/* Форма создания товара */}
      <section className="mb-8 bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-medium mb-3">Добавить новый товар</h2>

        {createError && (
          <div className="text-sm text-red-600 mb-2">{createError}</div>
        )}
        {createSuccess && (
          <div className="text-sm text-green-600 mb-2">
            {createSuccess}
          </div>
        )}

        <form onSubmit={handleCreateProduct} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Название *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Курс по дизайну"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Цена (Kč) *</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2 text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Категория</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="course / service / product ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">
              URL изображения (пока просто ссылка)
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Описание</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание товара / курса / услуги"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {creating ? 'Создаём...' : 'Создать товар'}
          </button>
        </form>
      </section>

      {/* Список товаров продавца */}
      <section>
        <h2 className="text-lg font-medium mb-3">Мои товары</h2>

        {loadingList && <div>Загрузка товаров...</div>}
        {errorList && (
          <div className="text-sm text-red-600 mb-2">{errorList}</div>
        )}

        {!loadingList && !errorList && products.length === 0 && (
          <div className="text-sm text-textSecondary">
            У вас пока нет ни одного товара.
          </div>
        )}

        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between bg-white border rounded-lg p-3 shadow-sm"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-textSecondary">
                  {p.price} Kč · {p.category || 'без категории'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteProduct(p._id)}
                className="text-xs text-red-600 hover:underline"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SellerDashboardPage;
