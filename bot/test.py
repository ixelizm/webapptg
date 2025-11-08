import cloudinary
import cloudinary.api
from pymongo import MongoClient

# MongoDB bağlantısı
client = MongoClient('mongodb+srv://ixel:Burak123.@tgdata.po9zm3c.mongodb.net/')

# Cloudinary yapılandırması
cloudinary.config(
    cloud_name='dcv9ovsgz',
    api_key='784879712531493',
    api_secret='t-yJK-4250XMXiVQFTMGwrpJhZI',
    secure=True
)

def get_all_images_from_cloudinary():
    """Cloudinary'deki TÜM resimleri getir"""
    all_images = []
    next_cursor = None
    
    try:
        while True:
            result = cloudinary.api.resources(
                type="upload",
                max_results=500,
                next_cursor=next_cursor
            )
            
            all_images.extend(result.get('resources', []))
            
            if 'next_cursor' not in result:
                break
            
            next_cursor = result['next_cursor']
            print(f"Yüklendi: {len(all_images)} resim...")
            
    except Exception as e:
        print(f"Hata: {e}")
    
    return all_images

def organize_by_folder(images):
    """Resimleri klasörlere göre grupla"""
    organized = {}
    
    for img in images:
        public_id = img['public_id']
        
        # Klasör adını public_id'den çıkar
        if '/' in public_id:
            folder = public_id.split('/')[0]
        else:
            folder = 'root'
        
        if folder not in organized:
            organized[folder] = []
        
        organized[folder].append(img)
    
    return organized

# 1. Cloudinary'den resimleri al
print("Tüm resimler indiriliyor...\n")
all_images = get_all_images_from_cloudinary()
print(f"\nToplam {len(all_images)} resim bulundu\n")

organized = organize_by_folder(all_images)

print(f"{'='*60}")
for folder, images in sorted(organized.items()):
    print(f"📁 {folder}: {len(images)} resim")
print(f"{'='*60}\n")

# 2. Resimleri asset_folder'a göre organize et
last = {}
for z in list(organized.values()):
    for i in z:
        asset_folder = i.get("asset_folder", "unknown")
        if last.get(asset_folder):
            last[asset_folder].append(i["url"])
        else:
            last.update({asset_folder: [i["url"]]})

print(f"\n{'='*60}")
print(f"📁 Toplam {len(last)} farklı klasör bulundu")
print(f"{'='*60}\n")

# 3. MongoDB işlemleri
db = client["test"]
col = db["profiles"]
all_profiles = list(col.find({}))

print(f"👥 Toplam {len(all_profiles)} profil bulundu\n")

# 4. Klasörleri liste olarak al
folder_list = list(last.keys())
if not folder_list:
    print("❌ Hiç klasör bulunamadı!")
    exit()

print("🔄 Profillere resimler atanıyor...\n")

# 5. Her profile sırayla klasör ata (döngüsel)
updated_count = 0
for i, profile in enumerate(all_profiles):
    # Döngüsel index: klasör sayısından fazla olursa başa dön
    folder_index = i % len(folder_list)
    current_folder = folder_list[folder_index]
    folder_images = last[current_folder]
    
    # MongoDB'yi güncelle
    result = col.update_one(
        {'_id': profile['_id']},
        {'$set': {'images': folder_images}}
    )
    
    if result.modified_count > 0:
        updated_count += 1
    
    # İlerlemeyi göster
    profile_name = profile.get('name', 'İsimsiz')
    print(f"✅ [{i+1}/{len(all_profiles)}] {profile_name} → {current_folder} ({len(folder_images)} resim)")

print(f"\n{'='*60}")
print(f"✅ İşlem tamamlandı!")
print(f"📊 {updated_count}/{len(all_profiles)} profil güncellendi")
print(f"📁 {len(folder_list)} klasör kullanıldı")
print(f"🔄 Döngü sayısı: {len(all_profiles) // len(folder_list)} (tam)")
print(f"{'='*60}\n")

# 6. Örnek profilleri göster
print("🔍 İlk 5 güncellenmiş profil:\n")
sample_profiles = col.find().limit(5)
for idx, profile in enumerate(sample_profiles, 1):
    print(f"{idx}. {profile.get('name', 'İsimsiz')}")
    print(f"   Resim sayısı: {len(profile.get('images', []))}")
    if profile.get('images'):
        print(f"   İlk resim: {profile['images'][0]}")
    print()