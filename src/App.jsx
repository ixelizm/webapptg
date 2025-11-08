import React, { useState } from 'react';
import { X, Phone, Calendar, MapPin } from 'lucide-react';

const ProfileGallery = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Grid sütun sayısını buradan değiştirebilirsiniz (2, 3, 4, vb.)
  const gridColumns = 3;

  const profiles = [
    {
      id: 1,
      name: "Ayşe Yılmaz",
      age: 24,
      phone: "+90 532 123 4567",
      location: "İstanbul",
      image: "https://i.pravatar.cc/300?img=1",
      bio: "Seyahat etmeyi ve fotoğrafçılığı seven bir grafik tasarımcı."
    },
    {
      id: 2,
      name: "Mehmet Demir",
      age: 28,
      phone: "+90 533 234 5678",
      location: "Ankara",
      image: "https://i.pravatar.cc/300?img=12",
      bio: "Yazılım geliştirici ve teknoloji tutkunu."
    },
    {
      id: 3,
      name: "Zeynep Kaya",
      age: 26,
      phone: "+90 534 345 6789",
      location: "İzmir",
      image: "https://i.pravatar.cc/300?img=5",
      bio: "Yoga eğitmeni ve wellness koçu."
    },
    {
      id: 4,
      name: "Can Özdemir",
      age: 30,
      phone: "+90 535 456 7890",
      location: "Antalya",
      image: "https://i.pravatar.cc/300?img=13",
      bio: "Restoran işletmecisi ve mutfak sanatları meraklısı."
    },
    {
      id: 5,
      name: "Elif Arslan",
      age: 23,
      phone: "+90 536 567 8901",
      location: "Bursa",
      image: "https://i.pravatar.cc/300?img=9",
      bio: "Müzik öğretmeni ve piyano sanatçısı."
    },
    {
      id: 6,
      name: "Burak Şahin",
      age: 27,
      phone: "+90 537 678 9012",
      location: "Adana",
      image: "https://i.pravatar.cc/300?img=14",
      bio: "Fitness antrenörü ve sporcu."
    },
    {
      id: 7,
      name: "Selin Çelik",
      age: 25,
      phone: "+90 538 789 0123",
      location: "Eskişehir",
      image: "https://i.pravatar.cc/300?img=10",
      bio: "İç mimar ve sanat galerisi küratörü."
    },
    {
      id: 8,
      name: "Emre Aydın",
      age: 29,
      phone: "+90 539 890 1234",
      location: "Trabzon",
      image: "https://i.pravatar.cc/300?img=15",
      bio: "Deniz biyoloğu ve doğa fotoğrafçısı."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-red-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 mb-6 text-center">
          Profil Galerisi
        </h1>
        
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="relative group cursor-pointer"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white font-semibold text-sm">{profile.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-gradient-to-br from-pink-400 via-purple-500 to-red-500">
              <img
                src={selectedProfile.image}
                alt={selectedProfile.name}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <button
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-purple-600" />
              </button>
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200">
                  <img
                    src={selectedProfile.image}
                    alt={selectedProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="pt-16 pb-6 px-6">
              <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
                {selectedProfile.name}
              </h2>
              
              <p className="text-gray-600 text-center text-sm mb-6 italic">
                {selectedProfile.bio}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Yaş</p>
                    <p className="text-gray-800 font-semibold">{selectedProfile.age} yaşında</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-red-50 p-4 rounded-xl">
                  <div className="bg-gradient-to-br from-purple-500 to-red-500 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Telefon</p>
                    <p className="text-gray-800 font-semibold">{selectedProfile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl">
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Konum</p>
                    <p className="text-gray-800 font-semibold">{selectedProfile.location}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileGallery;