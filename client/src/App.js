import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Failed to connect to backend'));
  }, []);

  return (
    <div className="App">
      <h1>👋 Hi!</h1>
      <p className="subtitle">Welcome to the server of Suyash Chandra.</p>
      <div className="card">
        <p>Backend says: <strong>{message}</strong></p>
      </div>
    </div>
  );
}

export default App;
