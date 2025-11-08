import React, { useState } from 'react';
import { X, Calendar, MapPin, ChevronLeft, ChevronRight, MessageCircle, CheckCircle, XCircle, User, Building2, BadgeCheck } from 'lucide-react';

const ProfileGallery = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const gridColumns = 3;

  const profiles = [
    {
      id: 1,
      name: "Ayşe Yılmaz",
      age: 24,
      phone: "+90 532 123 4567",
      location: "İstanbul",
      images: [
        "https://i.pravatar.cc/300?img=1",
        "https://i.pravatar.cc/300?img=47",
        "https://i.pravatar.cc/300?img=45"
      ],
      bio: "Seyahat etmeyi ve fotoğrafçılığı seven bir grafik tasarımcı.",
      verified: true,
      accountType: "bireysel"
    },
    {
      id: 2,
      name: "Mehmet Demir",
      age: 28,
      phone: "+90 533 234 5678",
      location: "Ankara",
      images: [
        "https://i.pravatar.cc/300?img=12",
        "https://i.pravatar.cc/300?img=33",
        "https://i.pravatar.cc/300?img=51"
      ],
      bio: "Yazılım geliştirici ve teknoloji tutkunu.",
      verified: false,
      accountType: "ajans"
    },
    {
      id: 3,
      name: "Zeynep Kaya",
      age: 26,
      phone: "+90 534 345 6789",
      location: "İzmir",
      images: [
        "https://i.pravatar.cc/300?img=5",
        "https://i.pravatar.cc/300?img=48",
        "https://i.pravatar.cc/300?img=44"
      ],
      bio: "Yoga eğitmeni ve wellness koçu.",
      verified: true,
      accountType: "bireysel"
    },
    {
      id: 4,
      name: "Can Özdemir",
      age: 30,
      phone: "+90 535 456 7890",
      location: "Antalya",
      images: [
        "https://i.pravatar.cc/300?img=13",
        "https://i.pravatar.cc/300?img=52",
        "https://i.pravatar.cc/300?img=59"
      ],
      bio: "Restoran işletmecisi ve mutfak sanatları meraklısı.",
      verified: true,
      accountType: "ajans"
    },
    {
      id: 5,
      name: "Elif Arslan",
      age: 23,
      phone: "+90 536 567 8901",
      location: "Bursa",
      images: [
        "https://i.pravatar.cc/300?img=9",
        "https://i.pravatar.cc/300?img=20",
        "https://i.pravatar.cc/300?img=41"
      ],
      bio: "Müzik öğretmeni ve piyano sanatçısı.",
      verified: false,
      accountType: "bireysel"
    },
    {
      id: 6,
      name: "Burak Şahin",
      age: 27,
      phone: "+90 537 678 9012",
      location: "Adana",
      images: [
        "https://i.pravatar.cc/300?img=14",
        "https://i.pravatar.cc/300?img=60",
        "https://i.pravatar.cc/300?img=68"
      ],
      bio: "Fitness antrenörü ve sporcu.",
      verified: true,
      accountType: "bireysel"
    },
    {
      id: 7,
      name: "Selin Çelik",
      age: 25,
      phone: "+90 538 789 0123",
      location: "Eskişehir",
      images: [
        "https://i.pravatar.cc/300?img=10",
        "https://i.pravatar.cc/300?img=32",
        "https://i.pravatar.cc/300?img=49"
      ],
      bio: "İç mimar ve sanat galerisi küratörü.",
      verified: false,
      accountType: "ajans"
    },
    {
      id: 8,
      name: "Emre Aydın",
      age: 29,
      phone: "+90 539 890 1234",
      location: "Trabzon",
      images: [
        "https://i.pravatar.cc/300?img=15",
        "https://i.pravatar.cc/300?img=56",
        "https://i.pravatar.cc/300?img=67"
      ],
      bio: "Deniz biyoloğu ve doğa fotoğrafçısı.",
      verified: true,
      accountType: "bireysel"
    }
  ];

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setCurrentImageIndex(0);
    setIsFullscreen(false);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
    setCurrentImageIndex(0);
    setIsFullscreen(false);
  };

  const nextImage = () => {
    if (selectedProfile) {
      setCurrentImageIndex((prev) => 
        prev === selectedProfile.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProfile) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProfile.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 mb-6 text-center">
          Profil Galerisi
        </h1>
        
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              className="relative group cursor-pointer"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <img
                  src={profile.images[0]}
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
          onClick={handleCloseProfile}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-gradient-to-br from-pink-400 via-purple-500 to-red-500 cursor-pointer" onClick={() => setIsFullscreen(true)}>
              <img
                src={selectedProfile.images[currentImageIndex]}
                alt={selectedProfile.name}
                className="w-full h-full object-cover"
              />
              
              {selectedProfile.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-purple-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {selectedProfile.images.length}
                  </div>
                </>
              )}
              
              <button
                onClick={handleCloseProfile}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg z-10"
              >
                <X className="w-5 h-5 text-purple-600" />
              </button>
              
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200">
                  <img
                    src={selectedProfile.images[0]}
                    alt={selectedProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="pt-16 pb-6 px-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  {selectedProfile.name}
                </h2>
                {selectedProfile.verified && (
                  <div className="flex-shrink-0">
                    <BadgeCheck className="w-7 h-7 text-white" fill="#3b82f6" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              
              <p className={`text-center text-xs font-medium mb-3 ${selectedProfile.verified ? 'text-blue-500' : 'text-gray-400'}`}>
                {selectedProfile.verified ? "Kimlik Onaylı Hesap" : "Henüz Onaylanmamış Hesap"}
              </p>
              
              <p className="text-gray-600 text-center text-sm mb-6 italic">
                {selectedProfile.bio}
              </p>


                <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Yaş</p>
                    <p className="text-gray-800 font-semibold">{selectedProfile.age} yaşında</p>
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

                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    {selectedProfile.accountType === "bireysel" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Building2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Hesap Türü</p>
                    <p className="text-gray-800 font-semibold">
                      {selectedProfile.accountType === "bireysel" ? "Bireysel" : "Ajans"}
                    </p>
                  </div>
                </div>
              </div>
                    <div 
                  onClick={() => window.open(`https://wa.me/${selectedProfile.phone.replace(/\s/g, '')}`, '_blank')}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold text-lg">WhatsApp</span>
                </div>

              <button
                onClick={handleCloseProfile}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Kapat
              </button>
            </div>
          </div>
        
      )}

      {isFullscreen && selectedProfile && (
        <div
          className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg z-10"
          >
            <X className="w-6 h-6 text-purple-600" />
          </button>

          <img
            src={selectedProfile.images[currentImageIndex]}
            alt={selectedProfile.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {selectedProfile.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 text-purple-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight className="w-6 h-6 text-purple-600" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {selectedProfile.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileGallery;