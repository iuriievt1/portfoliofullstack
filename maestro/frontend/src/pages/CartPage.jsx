import { useState } from 'react';
import api from '../api/client';
import { useCart } from '../context/CartContext.jsx';

function CartPage() {
  const {
    items,
    totalCount,
    totalPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleCheckout() {
    setError('');
    setSuccess('');

    if (!items.length) {
      setError('Корзина пуста');
      return;
    }

    const token = localStorage.getItem('maestro_token');
    if (!token) {
      setError('Нужно войти, чтобы оформить заказ');
      return;
    }

    try {
      setLoading(true);
      const body = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress,
      };

      const res = await api.post('/orders', body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(`Заказ создан. ID: ${res.data.order._id}`);
      clearCart();
      setShippingAddress('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при создании заказа');
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return <div>Корзина пуста.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Корзина</h1>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between bg-white border rounded-lg p-3"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-textSecondary">
                {item.price} Kč ×{' '}
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, e.target.value)
                  }
                  className="w-16 border rounded px-1 py-0.5 text-sm mx-1"
                />
                = {item.price * item.quantity} Kč
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.productId)}
              className="text-xs text-red-600 hover:underline"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4 text-sm">
        Товаров: <b>{totalCount}</b> <br />
        Общая сумма: <b>{totalPrice} Kč</b>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">
          Адрес доставки (можно пока просто текст)
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Город, улица, дом, комментарий..."
        />
      </div>

      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {success && (
        <div className="text-sm text-green-600 mb-2">{success}</div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-primary text-white text-sm hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Создаём заказ...' : 'Оформить заказ'}
      </button>
    </div>
  );
}

export default CartPage;
