import React, { useState } from 'react';
import ProfileGallery from './components/ProfileGallery';
import AdminPanel from './components/AdminPanel';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div>
      {showAdmin ? (
        <AdminPanel onBack={() => setShowAdmin(false)} />
      ) : (
        <ProfileGallery onAdminClick={() => setShowAdmin(true)} />
      )}
    </div>
  );
};

export default App;