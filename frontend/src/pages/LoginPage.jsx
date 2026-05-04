import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../features/authSlice';
import api from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  
  const searchParams = new URLSearchParams(window.location.search);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      if (redirect !== '/') {
        navigate(redirect);
      } else if (userInfo.role === 'admin') navigate('/admin/dashboard');
      else if (userInfo.role === 'pharmacist') navigate('/pharmacist/dashboard');
      else navigate('/');
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials(data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your Quick Relief account</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="block text-gray-700 text-sm font-semibold">Password</label>
              <a href="#" className="text-sm text-primary-600 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? <span className="animate-pulse">Signing in...</span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
