
import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
import { api } from '../services/api';
import { Patient, Prescription } from '../types';

const PrescriptionsView: React.FC = () => {
        const [selectedPending, setSelectedPending] = useState<Prescription | null>(null);
      const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([]);
    const [status, setStatus] = useState<string>('Pending');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedRfid, setSelectedRfid] = useState('');
  const [formData, setFormData] = useState<Partial<Prescription>>({
    paracetamol: 0,
    azithromycin: 0,
    revital: 0,
    frequency: 'Once a day',
    duration: '7 Days'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
      // Fetch all pending prescriptions on mount
      api.getPendingPrescriptions().then(setPendingPrescriptions);
    api.getPatients().then(setPatients);
  }, []);

  useEffect(() => {
    if (selectedRfid) {
      api.getPrescriptionByRfid(selectedRfid).then(p => {
        if (p) {
          setFormData(p);
          setStatus(p.status || 'Pending');
        } else {
          setFormData({
            paracetamol: 0,
            azithromycin: 0,
            revital: 0,
            frequency: 'Once a day',
            duration: '7 Days'
          });
          setStatus('Pending');
        }
      });
    }
  }, [selectedRfid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfid) return;

    try {
      const result = await api.updatePrescription({
        ...formData,
        rfidUid: selectedRfid,
        status,
        updatedAt: new Date().toISOString()
      } as Prescription);
      setAlertMessages(result.alerts || []);
      setErrorMessages([]);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      if (err.response && err.response.data) {
        setErrorMessages(err.response.data.errors || []);
        setAlertMessages(err.response.data.alerts || []);
      } else {
        setErrorMessages(['Unknown error occurred']);
      }
      setIsSuccess(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Pending Prescriptions List */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-700 mb-2">Pending Prescriptions</h2>
        <ul className="space-y-2">
          {pendingPrescriptions.length === 0 && <li className="text-slate-400">No pending prescriptions.</li>}
          {pendingPrescriptions.map(p => (
            <li key={p.rfidUid} className="bg-white p-4 rounded-xl border flex items-center justify-between">
              <span>
                <span className="font-bold cursor-pointer text-indigo-600 hover:underline" onClick={() => setSelectedPending(p)}>
                  {patients.find(pt => pt.rfidUid === p.rfidUid)?.name || p.rfidUid}
                </span>
                &nbsp;| <span className="font-bold">RFID:</span> {p.rfidUid} &nbsp;| <span className="font-bold"> Status:</span> {p.status}
              </span>
              <span className="flex gap-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={async () => {
                    await api.updatePrescriptionStatus(p.rfidUid, 'Cancelled');
                    setPendingPrescriptions(pendingPrescriptions.filter(x => x.rfidUid !== p.rfidUid));
                    if (selectedPending?.rfidUid === p.rfidUid) setSelectedPending(null);
                  }}
                >Cancel</button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={async () => {
                    await api.updatePrescriptionStatus(p.rfidUid, 'Dispensed');
                    setPendingPrescriptions(pendingPrescriptions.filter(x => x.rfidUid !== p.rfidUid));
                    if (selectedPending?.rfidUid === p.rfidUid) setSelectedPending(null);
                  }}
                >Dispense</button>
              </span>
            </li>
          ))}
              {/* Show details for selected pending prescription */}
              {selectedPending && (
                <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                  <h3 className="font-bold text-indigo-700 mb-2">Pending Prescription Details</h3>
                  <div><b>Patient:</b> {patients.find(pt => pt.rfidUid === selectedPending.rfidUid)?.name || selectedPending.rfidUid}</div>
                  <div><b>RFID:</b> {selectedPending.rfidUid}</div>
                  <div><b>Status:</b> {selectedPending.status}</div>
                  <div><b>Paracetamol:</b> {selectedPending.paracetamol}</div>
                  <div><b>Azithromycin:</b> {selectedPending.azithromycin}</div>
                  <div><b>Revital:</b> {selectedPending.revital}</div>
                  <div><b>Frequency:</b> {selectedPending.frequency}</div>
                  <div><b>Duration:</b> {selectedPending.duration}</div>
                  <button className="mt-4 px-4 py-2 bg-slate-300 rounded hover:bg-slate-400" onClick={() => setSelectedPending(null)}>Close</button>
                </div>
              )}
        </ul>
      </div>
      {/* Alert/Error Popups */}
      {(alertMessages.length > 0 || errorMessages.length > 0) && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          {alertMessages.map((msg, idx) => (
            <div key={idx} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-2 rounded shadow">
              <strong>Alert:</strong> {msg}
            </div>
          ))}
          {errorMessages.map((msg, idx) => (
            <div key={idx} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-2 rounded shadow">
              <strong>Error:</strong> {msg}
            </div>
          ))}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prescription Center</h1>
        <p className="text-slate-500">Configure medication quantities for automated dispensing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Patient</h2>
              <select
                className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                value={selectedRfid}
                onChange={e => setSelectedRfid(e.target.value)}
              >
                <option value="">Choose a patient profile...</option>
                {patients.map(p => (
                  <option key={p.rfidUid} value={p.rfidUid}>
                    {p.name} ({p.rfidUid})
                  </option>
                ))}
              </select>
            </section>

            {selectedRfid && (
              <>
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Servo-Mapped Medicines</h2>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase">ESP32: Fixed Mapping</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MedicineCounter
                      label="Paracetamol"
                      subtitle="Servo 1"
                      value={formData.paracetamol || 0}
                      onChange={val => setFormData({ ...formData, paracetamol: val })}
                    />
                    <MedicineCounter
                      label="Azithromycin"
                      subtitle="Servo 2"
                      value={formData.azithromycin || 0}
                      onChange={val => setFormData({ ...formData, azithromycin: val })}
                    />
                    <MedicineCounter
                      label="Revital"
                      subtitle="Servo 3"
                      value={formData.revital || 0}
                      onChange={val => setFormData({ ...formData, revital: val })}
                    />
                  </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                    <input
                      type="text"
                      value={formData.frequency || ''}
                      onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="e.g. 2x Daily"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 5 Days"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                    <select
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Dispensed">Dispensed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </section>

                <div className="pt-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {isSuccess && (
                      <div className="flex items-center text-emerald-600 font-medium text-sm animate-in fade-in slide-in-from-left-4">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Prescription updated successfully
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Save Prescription
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold flex items-center mb-4 text-slate-800">
              <Stethoscope className="w-5 h-5 mr-2 text-indigo-600" />
              Hardware Mapping
            </h3>
            <ul className="space-y-3">
              <MappingItem num={1} medicine="Paracetamol" />
              <MappingItem num={2} medicine="Azithromycin" />
              <MappingItem num={3} medicine="Revital" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicineCounter: React.FC<{ label: string, subtitle: string, value: number, onChange: (val: number) => void }> = ({ label, subtitle, value, onChange }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-indigo-100 transition-all text-center">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{subtitle}</p>
    <p className="font-bold text-slate-900 mb-4">{label}</p>
    <div className="flex items-center justify-center space-x-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100"
      >-</button>
      <span className="text-xl font-bold w-6">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(5, value + 1))}
        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-100"
      >+</button>
    </div>
    <p className="text-[10px] text-slate-400 mt-2">Tablets / Dose</p>
  </div>
);

const MappingItem: React.FC<{ num: number, medicine: string }> = ({ num, medicine }) => (
  <li className="flex items-center justify-between text-sm py-1">
    <span className="flex items-center text-slate-500">
      <span className="w-6 h-6 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold mr-2 border">S{num}</span>
      {medicine}
    </span>
    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
  </li>
);

export default PrescriptionsView;
