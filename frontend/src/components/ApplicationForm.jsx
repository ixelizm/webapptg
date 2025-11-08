import React, { useState } from 'react';
import { ArrowLeft, Upload, X, User, Building2, Camera } from 'lucide-react';

const API_URL = 'https://webapptg-production.up.railway.app/api';

const ApplicationForm = ({ onBackClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    location: '',
    accountType: 'bireysel',
    bio: ''
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 6) {
      alert('En fazla 6 fotoğraf yükleyebilirsiniz!');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'İsim alanı zorunludur';
    }

    if (!formData.age || formData.age < 18 || formData.age > 99) {
      newErrors.age = 'Geçerli bir yaş giriniz (18-99)';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası zorunludur';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Konum bilgisi zorunludur';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Kısa açıklama zorunludur';
    }

    if (images.length === 0) {
      newErrors.images = 'En az 1 fotoğraf yüklemelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Önce resimleri Cloudinary'ye yükle
      setLoadingMessage('Fotoğraflar yükleniyor...');
      console.log('📤 Resimler yükleniyor...');
      const imageFormData = new FormData();
      images.forEach((image) => {
        imageFormData.append('images', image);
      });

      const uploadResponse = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: imageFormData
      });

      if (!uploadResponse.ok) {
        throw new Error('Resimler yüklenemedi');
      }

      const uploadData = await uploadResponse.json();
      const imageUrls = uploadData.images;
      console.log('✅ Resimler yüklendi:', imageUrls);

      // 2. Başvuruyu gönder
      setLoadingMessage('Başvuru gönderiliyor...');
      console.log('📝 Başvuru gönderiliyor...');
      const applicationData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        accountType: formData.accountType,
        bio: formData.bio.trim(),
        images: imageUrls,
        createdAt: new Date().toISOString()
      };

      console.log('Gönderilen başvuru verisi:', applicationData);

      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      const responseData = await response.json();
      console.log('Sunucu yanıtı:', responseData);

      if (response.ok) {
        setLoadingMessage('Başarılı! Yönlendiriliyor...');
        alert('Başvurunuz başarıyla gönderildi! Onay bekliyor.');
        setFormData({
          name: '',
          age: '',
          phone: '',
          location: '',
          accountType: 'bireysel',
          bio: ''
        });
        setImages([]);
        setImagePreviews([]);
        setTimeout(() => {
          onBackClick();
        }, 1500);
      } else {
        alert('Başvuru gönderilemedi: ' + (responseData.error || responseData.message || 'Bir hata oluştu'));
      }
    } catch (error) {
      console.error('Başvuru hatası:', error);
      alert('Başvuru gönderilirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBackClick}
            className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400">
            Model Başvurusu
          </h1>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/10">
          <div className="space-y-6">
            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                İsim / Takma Ad *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 text-white border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Adınızı girin"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Yaş *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 text-white border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Yaşınız"
                min="18"
                max="99"
              />
              {errors.age && (
                <p className="text-red-400 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                WhatsApp Telefon Numarası *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 text-white border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="+90 555 123 4567"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Konum (Şehir) *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 text-white border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Örn: İstanbul, Ankara"
              />
              {errors.location && (
                <p className="text-red-400 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Hesap Türü *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'bireysel' }))}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.accountType === 'bireysel'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Bireysel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'ajans' }))}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.accountType === 'ajans'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-semibold">Ajans</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Kısa Açıklama *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 text-white border-2 border-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                placeholder="Kendinizden kısaca bahsedin..."
                rows="4"
              />
              {errors.bio && (
                <p className="text-red-400 text-sm mt-1">{errors.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-purple-300 text-sm font-semibold mb-2">
                Fotoğraflar * (En az 1, en fazla 6)
              </label>
              
              <div className="grid grid-cols-3 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-800">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                {images.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-purple-500/50 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-2 bg-gray-800/30 hover:bg-gray-800/50 transition-all">
                    <Camera className="w-8 h-8 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium">Ekle</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {errors.images && (
                <p className="text-red-400 text-sm mt-1">{errors.images}</p>
              )}
              
              <p className="text-gray-400 text-xs mt-2">
                {images.length}/6 fotoğraf yüklendi
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-bold py-4 rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {loadingMessage || 'Gönderiliyor...'}
                </span>
              ) : (
                'Başvuruyu Gönder'
              )}
            </button>

            <p className="text-gray-400 text-xs text-center">
              * işaretli alanlar zorunludur. Başvurunuz onaylandıktan sonra profiliniz yayınlanacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;