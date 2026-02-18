import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Edit, Trash2, Shield, Filter, Search, X } from 'lucide-react';
import { api } from '../services/api';
import { Patient } from '../types';

const PatientsView: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({
    status: 'Active',
    gender: 'Male'
  });

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Other'>('All');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRfid, setEditingRfid] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  // debounce searchTerm -> debouncedSearch
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadPatients = async () => {
    const data = await api.getPatients();
    setPatients(data);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editingRfid) {
        // Update existing patient
        const payload = { ...formData } as Patient;
        await api.updatePatient(editingRfid, payload);
        alert('Patient updated');
      } else {
        const result = await api.addPatient(formData as Patient);
        console.log("API Result:", result);
        alert("Patient added successfully!");
      }

      setModalOpen(false);
      setEditMode(false);
      setEditingRfid(null);
      loadPatients();
      setFormData({ status: 'Active', gender: 'Male' });
    } catch (err: any) {
      console.error("Save Patient Error:", err);
      if (err.response) {
        console.error("Server Response:", err.response.data);
        console.error("Status:", err.response.status);
      } else if (err.request) {
        console.error("No response received:", err.request);
      } else {
        console.error("Request setup error:", err.message);
      }
      alert(`Failed to save patient: ${err.message}`);
    }
  };

  // derived filtered list
  const filteredPatients = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return patients.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
      if (!s) return true;
      return (
        (p.name || '').toLowerCase().includes(s) ||
        (p.rfidUid || '').toLowerCase().includes(s) ||
        (p.condition || '').toLowerCase().includes(s)
      );
    });
  }, [patients, debouncedSearch, statusFilter, genderFilter]);

  // simple helpers for edit/delete (UI)
  const handleStartEdit = (p: Patient) => {
    setFormData(p);
    setEditMode(true);
    setEditingRfid(p.rfidUid);
    setModalOpen(true);
  };

  const handleDelete = async (rfidUid: string) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await api.deletePatient(rfidUid);
      loadPatients();
      alert('Patient deleted');
    } catch (err) {
      console.error('delete patient failed', err);
      alert('Failed to delete patient');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-slate-500">Manage patients and their RFID link status.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center transition-all shadow-lg shadow-indigo-200"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add New Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            aria-label="Search patients"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, RFID or condition..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />

          {searchTerm && (
            <button
              aria-label="Clear search"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 m-auto flex items-center justify-center bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600"
              style={{ height: 28, width: 28 }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <p className="text-[11px] text-slate-400 mt-2">Showing <strong className="text-slate-700">{filteredPatients.length}</strong> of <strong className="text-slate-700">{patients.length}</strong> patients</p>
        </div>

        <div className="flex gap-2 items-start">
          <div className="relative">
            <button
              onClick={() => setFiltersOpen(s => !s)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            {filtersOpen && (
              <div className="mt-2 w-56 bg-white border border-slate-100 shadow-md rounded-lg p-3 absolute right-0 z-20">
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={e => setGenderFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setGenderFilter('All');
                      setFiltersOpen(false);
                    }}
                    className="text-sm text-slate-500 mr-2"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); setGenderFilter('All'); }}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">RFID UID</th>
              <th className="px-6 py-4">Condition</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Added On</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No patients match your search / filters.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.rfidUid} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.age}y / {patient.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                      {patient.rfidUid}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{patient.condition}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    title="Edit patient"
                    onClick={() => {
                      setFormData(patient);
                      setEditMode(true);
                      setEditingRfid(patient.rfidUid);
                      setModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    title="Delete patient"
                    onClick={async () => {
                      if (!confirm(`Delete patient ${patient.name} (${patient.rfidUid})? This cannot be undone.`)) return;
                      try {
                        await api.deletePatient(patient.rfidUid);
                        loadPatients();
                        alert('Patient deleted');
                      } catch (err) {
                        console.error('Delete failed', err);
                        alert('Failed to delete patient');
                      }
                    }}
                    className="p-2 text-rose-500 hover:text-rose-600 transition-colors bg-white/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editMode ? 'Edit Patient' : 'New Patient Enrollment'}</h2>
              <button onClick={() => { setModalOpen(false); setEditMode(false); setEditingRfid(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                  <input
                    required
                    type="number"
                    value={formData.age || ''}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-indigo-500" />
                  RFID UID (Primary Key)
                </label>
                <input
                  required
                  type="text"
                  placeholder="Scan tag or enter UID..."
                  value={formData.rfidUid || ''}
                  onChange={e => setFormData({ ...formData, rfidUid: e.target.value.toUpperCase() })}
                  className={`w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono ${editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={editMode}
                />
                {editMode && (
                  <p className="text-xs text-slate-400 mt-2">RFID cannot be changed when editing — create a new profile to use a different tag.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Medical Condition</label>
                <textarea
                  value={formData.condition || ''}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                ></textarea>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  {editMode ? 'Update Patient' : 'Create Patient Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsView;