"use client";

import React, { useState } from 'react';
import VulnerableService from '@services/VulnerableService';

export default function UserInformationViewer() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const handleCheckInfo = async () => {
    setError('');
    setRole('');
    
    if (username.trim() === '') {
      setError('Username can not be empty');
      return; 
    }

    try {
      const user = await VulnerableService.getUserByUsername(username);
      if (user && user.role) {
        setRole(user.role);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <main>
      <h1 className="pageTitle">Check User Information</h1>
      
      <div className="flex items-center gap-2">
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Enter username" 
          className="border rounded px-1"
        />
        <button 
            onClick={handleCheckInfo}
            className="bg-gray-300 border border-black rounded px-3 max-w-[160px]"
        >
          Get Info
        </button>
      </div>

      {error && (
        <div className='text-red-800'>
           {error}
        </div>
      )}

      {username && role && (
        <div>
          <p>user name: <span className='text-purple-700 font-bold'>{username}</span></p> 
          <p>user info: <span className='text-purple-700 font-bold'>{role}</span></p> 
        </div>
      )}
    </main>
  );
}