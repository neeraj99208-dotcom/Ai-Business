import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import logi from './login.png';
import Dash from './dash.jsx';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login successfully!");
        navigate('/dash'); // Change '/dashboard' to your original/target page route
      } else {
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#050505] h-screen flex justify-center items-center">
      <form onSubmit={handleLogin} className="bg-white w-80 p-4 rounded-lg shadow-lg flex flex-col justify-center gap-2 text-black">
        <div className="px-12 text-xl flex flex-row gap-2">
          <h1 className="text-2xl font-bold">
            Login form  </h1>
          <img src={logi} alt="" className="h-10 w-12"/>
        </div>
        
        {errorMessage && (
          <p className="text-red-500 text-sm text-center font-semibold">{errorMessage}</p>
        )}
        
        <input 
          type="text" 
          placeholder="enter your name" 
          value={username} 
          className="h-12 border border-gray-700 rounded my-4 p-3" 
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          required
        />
        
        <input 
          type="password" 
          placeholder="enter your password" 
          className="h-12 border border-gray-700 rounded p-3" 
          value={password} 
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        />

        <button type="submit" className="bg-blue-400 p-3 rounded text-lg hover:bg-gray-200">
          submit
        </button>

        <div className="flex flex-row px-13 py-3 gap-2">
          <h1>Create account</h1>
          <Link to='/login' className="text-blue-700 text-xl">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default App;