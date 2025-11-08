import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Trash2, Edit, Save } from 'lucide-react';

const API_URL = 'https://webapptg-production.up.railway.app/api';

const AdminPanel = ({ onBack }) => {
  const [profiles, setProfiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    location: '',
    bio: '',
    verified: false,
    accountType: 'bireysel',
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`${API_URL}/profiles`);
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Profiller yüklenemedi:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Preview oluştur
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.images;
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls = formData.images;
      
      // Yeni resim varsa yükle
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages();
      }

      const profileData = {
        ...formData,
        age: parseInt(formData.age),
        images: imageUrls
      };

      const url = editingId 
        ? `${API_URL}/profiles/${editingId}`
        : `${API_URL}/profiles`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        alert(editingId ? 'Profil güncellendi!' : 'Profil eklendi!');
        resetForm();
        fetchProfiles();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Hata:', error);
      alert('İşlem başarısız!');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (profile) => {
    setFormData({
      name: profile.name,
      age: profile.age.toString(),
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      verified: profile.verified,
      accountType: profile.accountType,
      images: profile.images
    });
    setEditingId(profile._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu profili silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`${API_URL}/profiles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Profil silindi!');
        fetchProfiles();
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Profil silinemedi!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      phone: '',
      location: '',
      bio: '',
      verified: false,
      accountType: 'bireysel',
      images: []
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Geri</span>
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400">
            Yönetim Paneli
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            + Yeni Profil
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 border-2 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Profil Düzenle' : 'Yeni Profil Ekle'}
              </h2>
              <button onClick={() => { resetForm(); setShowForm(false); }}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="İsim"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Yaş"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <input
                type="tel"
                placeholder="Telefon (+905xxxxxxxxx)"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />

              <input
                type="text"
                placeholder="Konum"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />

              <textarea
                placeholder="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              />

              <div className="flex gap-4">
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bireysel">Bireysel</option>
                  <option value="ajans">Ajans</option>
                </select>

                <label className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Onaylı</span>
                </label>
              </div>

              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
                  <Upload className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-sm text-gray-400">
                    Resim seçin (maks 10)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {imagePreviews.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {editingId && formData.images.length > 0 && imagePreviews.length === 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {formData.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Current ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile._id} className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
              <img
                src={profile.images[0]}
                alt={profile.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                <p className="text-gray-400 text-sm">{profile.age} yaş • {profile.location}</p>
                <p className="text-gray-500 text-xs">{profile.accountType} • {profile.verified ? '✓ Onaylı' : 'Onaysız'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(profile)}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(profile._id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Henüz profil eklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;