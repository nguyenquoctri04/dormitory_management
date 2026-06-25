import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/providers/AuthProvider'
import { tailwindColors } from '../lib/colors'

export default function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const user = await auth.login(email, password)
      const role = user?.role ? String(user.role).toUpperCase() : ''
      if (role === 'ADMIN') navigate('/admin')
      else if (role === 'STAFF') navigate('/staff')
      else navigate('/student')
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (auth.isLoading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-cyan-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-red-600">Đăng nhập</h2>
          <p className="text-center text-gray-600 text-sm mt-2">Hệ thống quản lý ký túc xá</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-gray-600 text-sm">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-cyan-600 hover:text-cyan-700 cursor-pointer font-semibold transition"
            >
              Đăng ký tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
