
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  History,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { DispensingLog, DispenseStatus } from '../types';

const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<DispensingLog[]>([]);

  useEffect(() => {
    api.getLogs().then(setLogs);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispensing History</h1>
          <p className="text-slate-500">Audit trail of all medication dispensing events via RFID.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Filter Date
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Patient & RFID</th>
                <th className="px-6 py-4">Meds Dispensed</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No dispensing activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      {log.status === DispenseStatus.SUCCESS ? (
                        <div className="flex items-center text-emerald-600">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold">Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-600">
                          <XCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-bold">Failure</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{log.patientName}</p>
                      <code className="text-[10px] font-mono text-slate-400">{log.rfidUid}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {log.medicines.paracetamol > 0 && <MedBadge label="Parac" count={log.medicines.paracetamol} color="bg-blue-100 text-blue-700" />}
                        {log.medicines.azithromycin > 0 && <MedBadge label="Azith" count={log.medicines.azithromycin} color="bg-purple-100 text-purple-700" />}
                        {log.medicines.revital > 0 && <MedBadge label="Revital" count={log.medicines.revital} color="bg-amber-100 text-amber-700" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === DispenseStatus.FAILURE ? (
                        <span className="text-xs text-rose-500 font-medium italic">{log.errorMessage || 'System error'}</span>
                      ) : (
                        <span className="text-xs text-emerald-500 font-medium">Completed via Servo Control</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MedBadge: React.FC<{ label: string, count: number, color: string }> = ({ label, count, color }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
    {label}: {count}
  </span>
);

export default LogsView;
