
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  RotateCcw, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Inventory } from '../types';

const InventoryView: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const inv = await api.getInventory();
      // normalize: prefer servos array
      if (!inv.servos) {
        inv.servos = [];
        if (inv.servo1) inv.servos.push({ slot: 1, ...inv.servo1 });
        if (inv.servo2) inv.servos.push({ slot: 2, ...inv.servo2 });
        if (inv.servo3) inv.servos.push({ slot: 3, ...inv.servo3 });
      }
      setInventory(inv);
    } finally {
      setLoading(false);
    }
  };

  if (!inventory) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Status</h1>
          <p className="text-slate-500">Monitor and configure mechanical dispenser slots (servos).</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const name = prompt('New servo medicine name (e.g. Paracetamol)');
              if (!name) return;
              await api.addServo({ medicine: name, stock: 0, max: 100 });
              await load();
            }}
            className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            Add Servo
          </button>

          <button className="text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {inventory.servos.map((s: any, i: number) => (
          <EditableInventoryCard
            key={s.slot ?? i}
            index={i}
            servo={s}
            onChange={async (patch) => {
              // optimistic UI
              const updated = { ...inventory };
              updated.servos = updated.servos.map((sv: any, idx: number) => idx === i ? { ...sv, ...patch } : sv);
              setInventory(updated);
              try {
                await api.updateServo(i, patch);
                await load();
              } catch (err) {
                console.error('failed to update servo', err);
                await load();
              }
            }}
            onRemove={async () => {
              if (!confirm('Remove this servo slot?')) return;
              await api.removeServo(i);
              await load();
            }}
          />
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          Refill Alerts
        </h2>
        <div className="space-y-4">
          {inventory.servos.filter((sv: any) => sv.stock < Math.max(20, Math.floor(sv.max * 0.2))).length === 0 ? (
            <p className="text-sm text-slate-500">No refill alerts.</p>
          ) : (
            inventory.servos.map((sv: any, idx: number) => (
              sv.stock < Math.max(20, Math.floor(sv.max * 0.2)) && (
                <div key={idx} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-amber-600 mr-3" />
                    <div>
                      <p className="font-bold text-slate-900">{sv.medicine} Stock Low</p>
                      <p className="text-xs text-amber-700">Only {sv.stock} tablets remaining in slot {sv.slot ?? idx + 1}.</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const add = Number(prompt('Add how many tablets?', '50')) || 0;
                      if (add <= 0) return;
                      try {
                        await api.updateServo(idx, { stock: Math.min((sv.stock || 0) + add, sv.max) });
                        await load();
                      } catch (err) {
                        console.error(err);
                        alert('Failed to add tablets');
                      }
                    }}
                    className="bg-white px-4 py-2 rounded-lg text-sm font-bold text-amber-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    Add Tablets
                  </button>
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const InventoryCard: React.FC<{ servoNum: number, data: any, color: string }> = ({ servoNum, data, color }) => {
  const percent = (data.stock / data.max) * 100;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 transition-transform group-hover:scale-110`}>
        <Package className="w-full h-full" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servo 0{servoNum}</span>
        {data.stock < 30 ? (
          <span className="flex items-center text-[10px] font-bold text-rose-500 animate-pulse uppercase">
             Critical Stock
          </span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">{data.medicine}</h3>
      <p className="text-xs text-slate-500 mb-6">Standard Unit: 500mg Tab</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-500 font-medium">Capacity</span>
          <span className="text-slate-900 font-bold">{data.stock} / {data.max}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-${color}-500 rounded-full transition-all duration-1000`} 
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      <button className="mt-8 w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors">
        View Analytics
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const EditableInventoryCard: React.FC<{ index: number; servo: any; onChange: (patch: any) => void; onRemove: () => void }> = ({ index, servo, onChange, onRemove }) => {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ ...servo });

  useEffect(() => setLocal({ ...servo }), [servo]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slot {servo.slot ?? index + 1}</div>
          <h3 className="text-lg font-bold">{servo.medicine}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(e => !e)} className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-600">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-2 bg-white rounded-lg text-rose-500 hover:text-rose-600">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Stock</div>
            <div className="text-2xl font-bold">{local.stock}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onChange({ stock: Math.max(0, (servo.stock || 0) - 1) })} className="px-3 py-2 bg-slate-50 rounded-lg">-</button>
            <button onClick={() => onChange({ stock: Math.min((servo.stock || 0) + 1, servo.max) })} className="px-3 py-2 bg-slate-50 rounded-lg">+</button>
            <button onClick={async () => {
              const add = Number(prompt('Add how many tablets?', '10')) || 0;
              if (add <= 0) return;
              onChange({ stock: Math.min((servo.stock || 0) + add, servo.max) });
            }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
          </div>
        </div>

        {editing && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Medicine</label>
              <input value={local.medicine} onChange={e => setLocal({ ...local, medicine: e.target.value })} className="w-full px-3 py-2 bg-slate-50 rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max capacity</label>
                <input type="number" value={local.max} onChange={e => setLocal({ ...local, max: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current stock</label>
                <input type="number" value={local.stock} onChange={e => setLocal({ ...local, stock: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-50 rounded-lg" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setLocal({ ...servo }); }} className="px-4 py-2 bg-white border rounded-lg">Cancel</button>
              <button onClick={() => { onChange(local); setEditing(false); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        )}

        {!editing && (
          <div className="text-sm text-slate-400">Max: {servo.max} tablets</div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;

