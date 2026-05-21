import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }

    setIsSubmitting(true)
    try {
      await api.registerStudent({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      })
      setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-red-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-cyan-600">Đăng ký tài khoản</h2>
          <p className="text-center text-gray-600 text-sm mt-2">Hệ thống quản lý ký túc xá</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg cursor-pointer transition disabled:opacity-50"
          >
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </form>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-center text-gray-600 text-sm">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-red-600 hover:text-red-700 cursor-pointer font-semibold transition"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
