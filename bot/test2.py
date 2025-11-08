from pymongo import MongoClient

# MongoDB bağlantısı
client = MongoClient('mongodb+srv://ixel:Burak123.@tgdata.po9zm3c.mongodb.net/')
db = client["test"]
col = db["profiles"]

# MongoDB'den tüm profilleri al
all_profiles = list(col.find({}))

# Elindeki 9 numara
numbers = [
    "+212784481544",
    "+639551624412",
    "+380999769610",
    "+380959862617",
    "+6283824817933",
    "+639304832933",
    "+639758284090",
    "+6281288304416",
    "+639551254295"
]

# Profile'lara numara ekle
for i, profile in enumerate(all_profiles):
    phone_number = numbers[i % len(numbers)]  # numara tekrar edebilir
    col.update_one(
        {"_id": profile["_id"]},
        {"$set": {"phone": phone_number}}
    )

print("✅ Numara güncelleme tamamlandı")
