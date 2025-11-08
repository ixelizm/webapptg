import React, { useState } from 'react';
import ProfileGallery from './components/ProfileGallery';
import AdminPanel from './components/AdminPanel';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div>
      
        <ProfileGallery />

    </div>
  );
};

export default App;