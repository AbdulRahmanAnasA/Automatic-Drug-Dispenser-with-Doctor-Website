
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { api } from '../services/api';
import { Patient, DispensingLog, Inventory, DispenseStatus } from '../types';

const DashboardView: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [logs, setLogs] = useState<DispensingLog[]>([]);
  const [inventory, setInventory] = useState<Inventory | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [p, l, i] = await Promise.all([
        api.getPatients(),
        api.getLogs(),
        api.getInventory()
      ]);
      setPatients(p);
      setLogs(l);
      setInventory(i);
    };
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Active Patients', 
      value: patients.filter(p => p.status === 'Active').length, 
      icon: <Users className="w-5 h-5" />, 
      color: 'bg-blue-500', 
      trend: '+12%' 
    },
    { 
      label: 'Dispensed (24h)', 
      value: logs.filter(l => l.status === DispenseStatus.SUCCESS).length, 
      icon: <CheckCircle2 className="w-5 h-5" />, 
      color: 'bg-emerald-500', 
      trend: '+5.4%' 
    },
    { 
      label: 'Failed Attempts', 
      value: logs.filter(l => l.status === DispenseStatus.FAILURE).length, 
      icon: <AlertCircle className="w-5 h-5" />, 
      color: 'bg-rose-500', 
      trend: '-2%' 
    },
    { 
      label: 'Inventory Alerts', 
      value: inventory ? Object.values(inventory).filter(s => s.stock < 20).length : 0, 
      icon: <Activity className="w-5 h-5" />, 
      color: 'bg-amber-500', 
      trend: 'Normal' 
    },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 19 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 10 },
    { name: 'Sun', count: 8 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-500 mt-1">Real-time status of medication dispensers and patient metrics.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">System Time</p>
          <div className="flex items-center text-slate-700 font-mono text-lg bg-white border px-3 py-1 rounded-lg shadow-sm">
            <Clock className="w-4 h-4 mr-2 text-indigo-500" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-2.5 rounded-xl text-white`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Dispensing Activity (Weekly)
            </h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-600" />
            Recent Logs
          </h2>
          <div className="space-y-6">
            {logs.length === 0 ? (
              <p className="text-slate-400 text-center py-12 italic">No recent activity</p>
            ) : (
              logs.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-start">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 mr-4 ${
                    log.status === DispenseStatus.SUCCESS ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{log.patientName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {log.status === DispenseStatus.SUCCESS ? 'Successfully dispensed' : 'Failed attempt'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 tracking-wider">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
