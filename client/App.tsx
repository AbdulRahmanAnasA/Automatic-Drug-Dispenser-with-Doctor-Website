
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  Package, 
  Cpu, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

// Error boundary so runtime errors show a helpful message instead of a blank page
class AppErrorBoundary extends React.Component<any, any> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // could send telemetry here
    // console.error('Unhandled UI error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="max-w-xl w-full bg-white border rounded-2xl shadow p-8 text-center">
            <h2 className="text-lg font-bold mb-2 text-rose-600">Application error</h2>
            <p className="text-sm text-slate-600 mb-4">An unexpected error occurred while rendering the UI.</p>
            <pre className="text-xs bg-slate-100 p-3 rounded mb-4 text-left overflow-auto">{String(this.state.error && this.state.error.message)}</pre>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { localStorage.removeItem('medlink_user'); window.location.reload(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Clear user & reload</button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border rounded-lg">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

import DashboardView from './views/DashboardView';
import PatientsView from './views/PatientsView';
import PrescriptionsView from './views/PrescriptionsView';
import LogsView from './views/LogsView';
import InventoryView from './views/InventoryView';
import HardwareEmulator from './views/HardwareEmulator';
import LoginView from './views/LoginView';

import { MOCK_DOCTOR } from './constants';
import { Doctor } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<Doctor | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Simple auth persistence simulation (defensive around corrupt localStorage)
  useEffect(() => {
    const saved = localStorage.getItem('medlink_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.warn('medlink_user in localStorage is corrupt — clearing it.', err);
        localStorage.removeItem('medlink_user');
        setUser(null);
      }
    }
  }, []);

  const handleLogin = (doctor: Doctor) => {
    setUser(doctor);
    try {
      localStorage.setItem('medlink_user', JSON.stringify(doctor));
    } catch (err) {
      console.warn('Failed to persist user to localStorage', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('medlink_user');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <AppErrorBoundary>
      <Router>
        <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {!isSidebarOpen && (
           <button 
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden"
           >
             <Menu className="w-5 h-5" />
           </button>
        )}

        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-indigo-900 text-white transition-all duration-300 flex flex-col lg:relative absolute h-full z-40 overflow-hidden`}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">MedLink</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-indigo-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            <SidebarLink to="/" icon={<LayoutDashboard />} label="Dashboard" />
            <SidebarLink to="/patients" icon={<Users />} label="Patients" />
            <SidebarLink to="/prescriptions" icon={<FileText />} label="Prescriptions" />
            <SidebarLink to="/inventory" icon={<Package />} label="Inventory" />
            <SidebarLink to="/logs" icon={<ClipboardList />} label="Dispensing Logs" />
            <div className="pt-4 mt-4 border-t border-indigo-800/50">
              <SidebarLink to="/emulator" icon={<Cpu />} label="HW Emulator" className="bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" />
            </div>
          </nav>

          <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center p-3 rounded-lg bg-indigo-800/50 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-indigo-300 truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-sm text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 max-w-full">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search patient, RFID, or drug..." 
                className="bg-transparent border-none text-sm focus:ring-0 w-full"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>

          {/* Viewport */}
          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/patients" element={<PatientsView />} />
              <Route path="/prescriptions" element={<PrescriptionsView />} />
              <Route path="/inventory" element={<InventoryView />} />
              <Route path="/logs" element={<LogsView />} />
              <Route path="/emulator" element={<HardwareEmulator />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      </Router>
    </AppErrorBoundary>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, className?: string }> = ({ to, icon, label, className = "" }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all ${
        isActive 
          ? 'bg-white text-indigo-900 shadow-sm' 
          : 'text-indigo-100 hover:bg-indigo-800'
      } ${className}`}
    >
      <span className="w-5 h-5 mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export default App;
