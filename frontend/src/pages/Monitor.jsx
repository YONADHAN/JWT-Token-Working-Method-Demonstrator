import React, { useState, useEffect } from 'react';
import  Card  from '../components/Card';

const TokenMonitor = () => {
  const [status, setStatus] = useState({
    isAuthenticated: false,
    role: null,
    isPolling: false,
    lastRefresh: null
  });
  const [logs, setLogs] = useState([]);
  const [values, setValues] = useState([]);

  // Add a log entry with timestamp
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { message, timestamp, type }]);
  };

  // Handle login
  const handleLogin = async (role) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: role })
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({
          ...prev,
          isAuthenticated: true,
          role: data.role,
          lastRefresh: new Date()
        }));
        addLog(`Logged in as ${role}`, 'success');
      } else {
        addLog('Login failed', 'error');
      }
    } catch (error) {
      addLog(`Login error: ${error.message}`, 'error');
    }
  };

  // Start/Stop polling
  const togglePolling = () => {
    setStatus(prev => ({
      ...prev,
      isPolling: !prev.isPolling
    }));
    addLog(status.isPolling ? 'Polling stopped' : 'Polling started');
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/refresh_token', {
        credentials: 'include'
      });

      if (response.ok) {
        setStatus(prev => ({
          ...prev,
          lastRefresh: new Date()
        }));
        addLog('Token refreshed', 'success');
        return true;
      }
      return false;
    } catch (error) {
      addLog(`Refresh failed: ${error.message}`, 'error');
      return false;
    }
  };

  // Poll for data
  useEffect(() => {
    let intervalId;

    if (status.isPolling && status.isAuthenticated) {
      intervalId = setInterval(async () => {
        const endpoint = status.role === 'admin' 
          ? '/admin/test_process_token' 
          : '/user/test_process_token';

        try {
          const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'POST',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            console.log("data", data);
            setValues(prev => [...prev.slice(-9), data]);
            console.log(data)
          } else if (response.status === 401) {
            addLog('Token expired, attempting refresh...', 'warning');
            const refreshed = await refreshToken();
            if (!refreshed) {
              setStatus(prev => ({
                ...prev,
                isAuthenticated: false,
                isPolling: false
              }));
              addLog('Session expired. Please login again.', 'error');
            }
          }
        } catch (error) {
          addLog(`Polling error: ${error.message}`, 'error');
        }
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [status.isPolling, status.isAuthenticated, status.role]);

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">JWT Token Monitor</h2>
        
        {/* Login Controls */}
        <div className="flex gap-4">
          <button
            onClick={() => handleLogin('user')}
            disabled={status.isAuthenticated}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Login as User
          </button>
          <button
            onClick={() => handleLogin('admin')}
            disabled={status.isAuthenticated}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Login as Admin
          </button>
        </div>

        {/* Status Information */}
        {status.isAuthenticated && (
          <div className="p-4 bg-gray-100 rounded space-y-2">
            <p>Role: {status.role}</p>
            <p>Last Token Refresh: {status.lastRefresh?.toLocaleTimeString()}</p>
            <button
              onClick={togglePolling}
              className={`w-full px-4 py-2 text-white rounded ${
                status.isPolling ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {status.isPolling ? 'Stop Polling' : 'Start Polling'}
            </button>
          </div>
        )}

        {/* Logs Section */}
        <div className="space-y-2">
          <h3 className="font-semibold">Activity Log:</h3>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  log.type === 'error' ? 'bg-red-100' :
                  log.type === 'success' ? 'bg-green-100' :
                  log.type === 'warning' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}
              >
                [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        {values.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Received Values:</h3>
            <div className="space-y-2">
              {values.map((value, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                  Value: {value.value?.toFixed(2)} - Time: {new Date(value.timestamp).toLocaleTimeString()}
                  
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TokenMonitor;