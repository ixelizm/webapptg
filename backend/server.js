import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Profile from './models/Profile.js';
import { upload, cloudinary } from './config/cloudinary.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Telegram Profile API çalışıyor! 🚀' });
});

// 📸 Çoklu resim yükleme
app.post('/api/upload', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }
    
    const imageUrls = req.files.map(file => file.path);
    
    res.json({
      success: true,
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📋 Tüm profilleri getir (filtreleme ile)
app.get('/api/profiles', async (req, res) => {
  try {
    const { accountType, verified } = req.query;
    
    let filter = {};
    if (accountType && accountType !== 'all') {
      filter.accountType = accountType;
    }
    if (verified && verified !== 'all') {
      filter.verified = verified === 'verified';
    }
    
    const profiles = await Profile.find(filter).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔍 Tek profil getir
app.get('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profil bulunamadı' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➕ Yeni profil ekle
app.post('/api/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✏️ Profil güncelle
app.put('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Profil bulunamadı' });
    }
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 🗑️ Profil sil
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profil bulunamadı' });
    }
    
    // Cloudinary'den resimleri sil
    for (const imageUrl of profile.images) {
      try {
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Resim silme hatası:', err);
      }
    }
    
    res.json({ message: 'Profil ve resimleri silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📍 http://localhost:${PORT}`);
});