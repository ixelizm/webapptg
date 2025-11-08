import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Profile from './models/Profile.js';
import Application from './models/Application.js';
import ViewCounter from './models/Views.js'
import { upload, cloudinary } from './config/cloudinary.js';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// Health check
// Kullanıcı kontrolü endpoint'i
app.get('/api/telegram-users/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await TelegramUser.findOne({ telegramId });
    
    if (user) {
      res.json({ exists: true, user });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı kaydetme endpoint'i
app.post('/api/telegram-users', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, phone, location } = req.body;
    
    const newUser = new TelegramUser({
      telegramId,
      username,
      firstName,
      lastName,
      phone,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      createdAt: new Date()
    });
    
    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı kaydedilemedi' });
  }
});
app.post('/api/applications', async (req, res) => {
  try {
    const {
      name,
      age,
      location,
      phone,
      bio,
      accountType,
      images,
      createdAt
    } = req.body;

    // Validasyon
    if (!name || !age || !location || !phone || !bio || !images || images.length === 0) {
      return res.status(400).json({ 
        error: 'Tüm alanlar doldurulmalıdır' 
      });
    }

    if (age < 18 || age > 100) {
      return res.status(400).json({ 
        error: 'Yaş 18-100 arasında olmalıdır' 
      });
    }

    if (bio.length < 20) {
      return res.status(400).json({ 
        error: 'Biyografi en az 20 karakter olmalıdır' 
      });
    }

    if (images.length > 5) {
      return res.status(400).json({ 
        error: 'En fazla 5 fotoğraf yüklenebilir' 
      });
    }

    // Telefon numarası kontrolü (aynı numara ile başka başvuru var mı?)
    const existingApplication = await Application.findOne({ 
      phone, 
      status: 'pending' 
    });
    
    if (existingApplication) {
      return res.status(400).json({ 
        error: 'Bu telefon numarası ile bekleyen bir başvuru bulunmaktadır' 
      });
    }

    // Yeni başvuru oluştur
    const newApplication = new Application({
      name,
      age,
      location,
      phone,
      bio,
      accountType,
      images,
      verified: false,
      status: 'pending',
      createdAt: createdAt || new Date()
    });

    await newApplication.save();

    res.status(201).json({
      message: 'Başvurunuz başarıyla alındı',
      applicationId: newApplication._id
    });

  } catch (error) {
    console.error('Başvuru hatası:', error);
    res.status(500).json({ 
      error: 'Başvuru oluşturulurken bir hata oluştu' 
    });
  }
});

// 2. Tüm başvuruları getir (Admin paneli için)
app.get('/api/applications', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error('Başvuruları getirme hatası:', error);
    res.status(500).json({ error: 'Başvurular getirilemedi' });
  }
});

// 3. Başvuruyu onayla ve profile çevir
app.post('/api/applications/:id/approve', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Başvuru bulunamadı' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Bu başvuru zaten işleme alınmış' 
      });
    }

    // Profile dönüştür
    const newProfile = new Profile({
      name: application.name,
      age: application.age,
      location: application.location,
      phone: application.phone,
      bio: application.bio,
      accountType: application.accountType,
      images: application.images,
      verified: req.body.verified || false,
      active: true
    });

    await newProfile.save();

    // Başvuruyu güncelle
    application.status = 'approved';
    application.approvedAt = new Date();
    await application.save();

    res.json({
      message: 'Başvuru onaylandı ve profil oluşturuldu',
      profileId: newProfile._id
    });

  } catch (error) {
    console.error('Başvuru onaylama hatası:', error);
    res.status(500).json({ error: 'Başvuru onaylanamadı' });
  }
});

// 4. Başvuruyu reddet
app.post('/api/applications/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ error: 'Başvuru bulunamadı' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Bu başvuru zaten işleme alınmış' 
      });
    }

    application.status = 'rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = reason || 'Başvurunuz uygun görülmemiştir';
    await application.save();

    res.json({
      message: 'Başvuru reddedildi'
    });

  } catch (error) {
    console.error('Başvuru reddetme hatası:', error);
    res.status(500).json({ error: 'Başvuru reddedilemedi' });
  }
});




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
    
    // 30 adet profile alıyoruz
    const profiles = await Profile.find(filter)
      .sort({ createdAt: -1 })
      .limit(30);
      
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


// Görüntülenme sayısını artır
app.post('/api/views/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    const counter = await ViewCounter.findOneAndUpdate(
      { page },
      { 
        $inc: { count: 1 },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      page: counter.page, 
      count: counter.count 
    });
  } catch (error) {
    console.error('View counter error:', error);
    res.status(500).json({ error: 'Sayaç güncellenemedi' });
  }
});

// Görüntülenme sayısını getir
app.get('/api/views/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const counter = await ViewCounter.findOne({ page });
    
    res.json({ 
      page, 
      count: counter ? counter.count : 0 
    });
  } catch (error) {
    console.error('View counter error:', error);
    res.status(500).json({ error: 'Sayaç getirilemedi' });
  }
});
// 🗑️ Profil sil
app.get('/api/views', async (req, res) => {
  try {
    const counters = await ViewCounter.find().sort({ count: -1 });
    res.json(counters);
  } catch (error) {
    console.error('View counters error:', error);
    res.status(500).json({ error: 'Sayaçlar getirilemedi' });
  }
});
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