import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Trash2, Shield } from 'lucide-react';

const API_URL = 'https://webapptg-production.up.railway.app/api';

const AdminPanel = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/applications?status=pending`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Başvurular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (id, verified = false) => {
    try {
      const response = await fetch(`${API_URL}/applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified })
      });

      if (response.ok) {
        alert('Başvuru onaylandı!');
        fetchApplications();
      }
    } catch (error) {
      console.error('Onaylama hatası:', error);
    }
  };

  const rejectApplication = async (id) => {
    const reason = prompt('Red sebebi (opsiyonel):');
    try {
      const response = await fetch(`${API_URL}/applications/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('Başvuru reddedildi!');
        fetchApplications();
      }
    } catch (error) {
      console.error('Reddetme hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Panel - Bekleyen Başvurular</h1>
        
        {loading ? (
          <div className="text-center text-white">Yükleniyor...</div>
        ) : (
          <div className="grid gap-4">
            {applications.map(app => (
              <div key={app._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={app.images[0]} 
                    alt={app.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{app.name}</h3>
                    <p className="text-gray-400 text-sm">{app.age} yaş • {app.location}</p>
                    <p className="text-gray-400 text-sm">{app.accountType}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedApplication(app)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => approveApplication(app._id, false)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => approveApplication(app._id, true)}
                    className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => rejectApplication(app._id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;