import { useState } from 'react';
import api from '../api/client';

function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

      const { token, user } = res.data;
      localStorage.setItem('maestro_token', token);
      setSuccess(`Вход выполнен. Роль: ${user.role}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Вход</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Пароль</label>
          <input
            type="password"
            name="password"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Вхожу...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
