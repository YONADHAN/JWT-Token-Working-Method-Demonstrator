import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Monitor from './pages/Monitor';

const App = () => {
  return (
    <>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
      />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/monitor" replace />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="*" element={<Navigate to="/monitor" replace />} />
          </Routes>
        </Router>
      </div>
    </>
  );
};

export default App;