require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Environment variables
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot';
const API_URL = process.env.API_URL || 'https://webapptg-production.up.railway.app/api';
const WEB_APP_URL = process.env.WEB_APP_URL || 'YOUR_WEB_APP_URL';

// Environment variables kontrolü
console.log('🔧 Yapılandırma Kontrol:');
console.log('BOT_TOKEN:', BOT_TOKEN ? '✅ Ayarlandı' : '❌ Eksik');
console.log('MONGODB_URI:', MONGODB_URI ? '✅ Ayarlandı' : '❌ Eksik');
console.log('API_URL:', API_URL);
console.log('WEB_APP_URL:', WEB_APP_URL);
console.log('-------------------');

const telegramUserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  phone: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);

// MongoDB bağlantısı
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// Polling modu ile bot oluştur
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Geçici session storage
const userSessions = {};

console.log('🤖 Bot başlatıldı...');

// /start komutu
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  try {
    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    const existingUser = await TelegramUser.findOne({ telegramId: user.id.toString() });

    if (existingUser) {
      bot.sendMessage(chatId,
        `✅ Hoş geldiniz ${user.first_name}!\n\n` +
        'Zaten kayıtlısınız. Web uygulamasını kullanabilirsiniz.',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 BossO | VIP Giriş', web_app: { url: WEB_APP_URL } }
            ],
          [
              { text: '📍 BossO | Destek', callback_data: "test"}
            ]]
          }
        }
      );
      return;
    }

    // Yeni kullanıcı için kayıt başlat
const welcomeText = `Merhaba ${user.first_name}! 👋

🎨 *BossO | VIP*'ye hoş geldiniz!

⚠️ *UYARI: DOLANDIRICILIK VE SAHTEKARLIK YASAKTIR*  
Sayfadaki modellerin *görüşme öncesi ödeme alma yetkisi yoktur* 💳❌

🔹 *Önemli Kurallar*  
- *Elden ödeme dışında ödeme talep eden profilleri bildiriniz*.  
- *Onaylı profillerde, onaylanan kişi dışında bir başkasının gelmesi durumunda bildiriniz*.

📝 *Model Başvuruları*  
- *"Model Başvuru"* butonuna basarak profil oluşturabilirsiniz.  
- Profilleri *onaylı hale getirmek için kimlik doğrulaması zorunludur*.

⚖️ *Cezai İşlem*  
Kurallara uymayan kullanıcılar veya modeller *sistem tarafından kalıcı olarak yasaklanır* ❌

📍 *Bilgi Talebi*  
1️⃣ *Telefon numaranız* – Size uygun modellerle hızlı iletişim için.  
2️⃣ *Konumunuz* – En yakın (20 KM'ye kadar) aktif model profillerini göstermek için.  
⚠️ *Bilgileriniz sistemden çıktıktan sonra silinecektir*.
`;


    // Fotoğraf gönderme
    bot.sendPhoto(chatId, "logo.jpg", {
      caption: welcomeText,
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '📱 Telefon Numaramı Paylaş', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });



  } catch (error) {
    console.error('Start komut hatası:', error);
    bot.sendMessage(chatId, '❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
});

// Telefon numarası paylaşıldığında
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const contact = msg.contact;
  const user = msg.from;

  // Sadece kendi numarasını paylaşmışsa kabul et
  if (contact.user_id !== user.id) {
    bot.sendMessage(chatId, '⚠️ Lütfen kendi telefon numaranızı paylaşın.', {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Telefon Numaramı Paylaş', request_contact: true }]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // Telefon numarasını session'a kaydet
  userSessions[chatId] = {
    phone: contact.phone_number,
    userId: user.id,
    username: user.username || '',
    firstName: user.first_name,
    lastName: user.last_name || ''
  };

  bot.sendMessage(chatId,
    '✅ Telefon numaranız alındı!\n\n' +
    'Şimdi lütfen *konumunuzu* paylaşın.',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [{ text: '📍 Konumumu Paylaş', request_location: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    }
  );
});

// Konum paylaşıldığında
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const location = msg.location;

  if (!userSessions[chatId]) {
    bot.sendMessage(chatId,
      '⚠️ Lütfen önce telefon numaranızı paylaşın.\n\n' +
      'Kayıt işlemine başlamak için /start komutunu kullanın.'
    );
    return;
  }

  try {
    const session = userSessions[chatId];

    // Kullanıcıyı veritabanına kaydet
    const newUser = new TelegramUser({
      telegramId: session.userId.toString(),
      username: session.username,
      firstName: session.firstName,
      lastName: session.lastName,
      phone: session.phone,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });

    await newUser.save();

    // API'ye de kaydet (Railway backend)
    try {
      await fetch(`${API_URL}/telegram-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: session.userId.toString(),
          username: session.username,
          firstName: session.firstName,
          lastName: session.lastName,
          phone: session.phone,
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        })
      });
    } catch (apiError) {
      console.error('API kayıt hatası:', apiError);
    }

    // Session'ı temizle
    delete userSessions[chatId];

    bot.sendMessage(chatId,
      '🎉 *Kayıt işleminiz tamamlandı!*\n\n' +
      '✅ Telefon numarası kaydedildi\n' +
      '✅ Konum bilgisi kaydedildi\n\n' +
      'Artık profil galerisini görüntüleyebilirsiniz!',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
              { text: '🌐 BossO | VIP Giriş', web_app: { url: WEB_APP_URL } }
            ],
          [
              { text: '📍 BossO | Destek', callback_data: "test"}
            ]],
          remove_keyboard: true
        }
      }
    );

    console.log(`✅ Yeni kullanıcı kaydedildi: ${session.firstName} (${session.userId})`);

  } catch (error) {
    console.error('Kayıt hatası:', error);

    if (error.code === 11000) {
      bot.sendMessage(chatId,
        '⚠️ Bu hesap zaten kayıtlı.\n\n' +
        'Direkt olarak web uygulamasını kullanabilirsiniz.',
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 BossO | VIP Giriş', web_app: { url: WEB_APP_URL } }
            ],
          [
              { text: '📍 BossO | Destek', callback_data: "test"}
            ]]
          }
        }
      );
    } else {
      bot.sendMessage(chatId,
        '❌ Kayıt sırasında bir hata oluştu.\n\n' +
        'Lütfen /start komutu ile tekrar deneyin.'
      );
    }

    delete userSessions[chatId];
  }
});

// Diğer mesajlar için
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageType = msg.text || msg.caption || '';

  // Komut veya özel mesaj değilse
  if (!messageType.startsWith('/') && !msg.contact && !msg.location) {
    bot.sendMessage(chatId,
      '👋 Merhaba!\n\n' +
      'Kayıt olmak için /start komutunu kullanın.\n' +
      'Profil galerisini görüntülemek için kayıt olmanız gerekmektedir.',
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Kayıt Ol', callback_data: 'start_registration' }
          ]]
        }
      }
    );
  }
});

// Inline button callback
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'start_registration') {
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, '/start');
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling hatası:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Bot kapatılıyor...');
  bot.stopPolling();
  mongoose.connection.close();
  process.exit(0);
});

console.log('✅ Bot çalışıyor ve mesajları dinliyor...')