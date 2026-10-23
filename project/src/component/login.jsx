import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [task, settask] = useState([]);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Check if passwords match before sending to backend
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('https://ai-business-server.vercel.app/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sign up successful!");
        settask([...task, [username, password]]);
        
        // Reset form fields
        setUsername('');
        setPassword('');
        setConfirmPassword('');

        // Redirects to the login page upon successful submission
        navigate('/login'); 
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen flex justify-center items-center">
      <form onSubmit={handleSignup} className="bg-white w-80 p-6 rounded-lg shadow-lg flex flex-col justify-center gap-4 text-black">
        <h1 className="text-xl text-center font-bold">Sign Up</h1>

        <input 
          type="text" 
          placeholder="enter your username" 
          value={username} 
          className="border p-2 rounded w-full" 
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input 
          type="password" 
          placeholder="enter your password" 
          value={password} 
          className="border p-2 rounded w-full" 
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input 
          type="password" 
          placeholder="confirm password" 
          value={confirmPassword} 
          className="border p-2 rounded w-full" 
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" className='bg-blue-400 p-3 rounded text-lg hover:bg-blue-500 text-white font-medium text-center'>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;