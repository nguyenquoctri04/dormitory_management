import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
}

export default function StudentProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.getMe(token!);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  if (!profile) return <div className="text-center py-8">Không tìm thấy thông tin hồ sơ</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Hồ sơ cá nhân</h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên</label>
            <p className="text-gray-900">{profile.full_name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Điện thoại</label>
            <p className="text-gray-900">{profile.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
            <p className="text-gray-900">{profile.date_of_birth}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
            <p className="text-gray-900">{profile.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
