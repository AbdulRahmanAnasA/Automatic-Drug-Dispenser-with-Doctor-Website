
import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import { MOCK_DOCTOR } from '../constants';
import { Doctor } from '../types';

const LoginView: React.FC<{ onLogin: (doctor: Doctor) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'doctor' && password === 'admin123') {
      onLogin(MOCK_DOCTOR as Doctor);
    } else {
      setError('Invalid medical credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-800 rounded-full -mr-96 -mt-96 opacity-50 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-950 rounded-full -ml-48 -mb-48 opacity-50 blur-[100px]"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 pt-12 pb-6 text-center">
          <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Access Portal</h1>
          <p className="text-slate-500 mt-2">Sign in to manage patient medication flows.</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Username (use 'doctor')"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="Password (use 'admin123')"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            Authenticate Credentials
          </button>

          <div className="pt-4 text-center">
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors">Forgot Access Key?</a>
          </div>
        </form>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
            Secured by MedLink End-to-End Encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
