
import React, { useState, useEffect } from 'react';
import {
  Scan,
  Cpu,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  Zap,
  Power
} from 'lucide-react';
import { api } from '../services/api';

const HardwareEmulator: React.FC = () => {
  const [rfidInput, setRfidInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'FETCHING' | 'DISPENSING' | 'DONE' | 'ERROR'>('IDLE');
  const [prescription, setPrescription] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const simulateScan = async () => {
    if (!rfidInput) return;
    setStatus('SCANNING');
    setErrorMsg('');

    // Step 1: Simulated delay for hardware read
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Query MongoDB (via API)
    setStatus('FETCHING');
    const data = await api.fetchPrescriptionHardware(rfidInput);

    if (!data) {
      setStatus('ERROR');
      setErrorMsg("RFID UID not found in MongoDB.");
      await api.confirmDispensing(rfidInput, false, { error: "Invalid RFID" });
      return;
    }

    if (data.error) {
      setStatus('ERROR');
      setErrorMsg(data.error);
      await api.confirmDispensing(rfidInput, false, { error: data.error, prescription: data });
      return;
    }

    // Check if there's an active prescription (status should be 'Pending')
    if (data.status !== 'Pending') {
      setStatus('ERROR');
      setErrorMsg("No active prescription found.");
      await api.confirmDispensing(rfidInput, false, { error: "No Active Prescription", prescription: data });
      return;
    }

    // NEW: Check if any medicine is actually prescribed
    const totalMeds = (data.paracetamol || 0) + (data.azithromycin || 0) + (data.revital || 0);
    if (totalMeds === 0) {
      setStatus('ERROR');
      setErrorMsg("No medicine prescribed.");
      await api.confirmDispensing(rfidInput, false, { error: "No Medicine", prescription: data });
      return;
    }

    setPrescription(data);

    // Step 3: Mechanical movement simulation
    setStatus('DISPENSING');
    await new Promise(r => setTimeout(r, 2000));

    // Step 4: Finalize
    await api.confirmDispensing(rfidInput, true);
    setStatus('DONE');
  };

  const reset = () => {
    setStatus('IDLE');
    setRfidInput('');
    setPrescription(null);
    setErrorMsg('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-12">
      <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/30 p-4 rounded-2xl flex items-center">
        <Zap className="w-5 h-5 text-amber-500 mr-3" />
        <p className="text-amber-800 text-sm font-medium">
          <strong>Developer Tool:</strong> Use this emulator to simulate the physical ESP32 hardware device workflow.
        </p>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px]"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/10 p-4 rounded-full mb-6">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">ESP32 Device Node #001</h2>
          <p className="text-slate-400 text-sm mb-12">Waiting for Ultrasonic Trigger / RFID Scan...</p>

          <div className="w-full max-w-sm space-y-6">
            {status === 'IDLE' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="relative mb-6">
                  <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter RFID UID (e.g. A1B2C3D4)"
                    value={rfidInput}
                    onChange={e => setRfidInput(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-center font-mono text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={simulateScan}
                  disabled={!rfidInput}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Simulate RFID Tap
                </button>
              </div>
            )}

            {(status === 'SCANNING' || status === 'FETCHING' || status === 'DISPENSING') && (
              <div className="flex flex-col items-center py-8 space-y-6 animate-in fade-in scale-95 duration-300">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {status === 'SCANNING' && 'Capturing UID...'}
                    {status === 'FETCHING' && 'Querying MongoDB Database...'}
                    {status === 'DISPENSING' && 'Activating Servos...'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">DO NOT REMOVE CARD</p>
                </div>
              </div>
            )}

            {status === 'ERROR' && (
              <div className="animate-in zoom-in duration-300 space-y-6">
                <div className="bg-rose-500/20 text-rose-300 p-6 rounded-2xl border border-rose-500/30 flex flex-col items-center">
                  <XCircle className="w-12 h-12 mb-4" />
                  <p className="font-bold text-center">{errorMsg}</p>
                </div>
                <button onClick={reset} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all">
                  Try Again
                </button>
              </div>
            )}

            {status === 'DONE' && (
              <div className="animate-in zoom-in duration-300 space-y-6">
                <div className="bg-emerald-500/20 text-emerald-300 p-8 rounded-2xl border border-emerald-500/30 flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 mb-4" />
                  <p className="text-xl font-bold mb-2">Dispensed Successfully!</p>
                  <div className="flex space-x-4 text-xs font-mono opacity-80 mt-4">
                    <span>P:{prescription?.paracetamol}</span>
                    <span>A:{prescription?.azithromycin}</span>
                    <span>R:{prescription?.revital}</span>
                  </div>
                </div>
                <button onClick={reset} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-900/40">
                  Reset Hardware State
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-16 flex justify-between border-t border-white/5 pt-6 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-500/50"></span> WiFi: CONNECTED</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-white mr-2"></span> SERVOS: IDLE</span>
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span> API: SYNC</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100">
        <h3 className="font-bold mb-4">ESP32 Logic Flow</h3>
        <ol className="text-sm text-slate-600 space-y-3">
          <li className="flex items-start">
            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center mr-3 mt-0.5 border">01</span>
            Ultrasonic sensor detects proximity (user arrives).
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center mr-3 mt-0.5 border">02</span>
            RC522 module reads RFID UID from passive tag.
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center mr-3 mt-0.5 border">03</span>
            HTTP GET request sent to <code className="bg-slate-50 px-1 px-0.5 rounded text-indigo-600">/api/prescription/UID</code>.
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center mr-3 mt-0.5 border">04</span>
            Parse JSON response and rotate servos (S1, S2, S3) according to counts.
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold flex items-center justify-center mr-3 mt-0.5 border">05</span>
            POST confirmation back to server to update logs and cooldown timer.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default HardwareEmulator;
