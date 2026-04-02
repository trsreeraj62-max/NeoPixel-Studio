import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const TYPES = ['LED Strip', '8x8 Matrix', '16x16 Matrix', 'Smart Bulb', 'Custom'];
const CONN  = ['WiFi', 'Bluetooth', 'USB', 'Smart API'];

export default function Devices({ auth }) {
    const [devices, setDevices] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'LED Strip', connection_type: 'WiFi' });
    const [editId, setEditId] = useState(null);
    const [status, setStatus] = useState('');

    const token = () => document.querySelector('meta[name="csrf-token"]')?.content;

    const headers = {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
        'Accept': 'application/json',
    };

    const loadDevices = async () => {
        const r = await fetch('/api/devices', { headers, credentials: 'include' });
        if (r.ok) setDevices(await r.json());
    };

    useEffect(() => { loadDevices(); }, []);

    const save = async () => {
        const url = editId ? `/api/devices/${editId}` : '/api/devices';
        const method = editId ? 'PATCH' : 'POST';
        const r = await fetch(url, { method, headers, credentials: 'include', body: JSON.stringify(form) });
        if (r.ok) { setModal(false); setEditId(null); setForm({ name:'', type:'LED Strip', connection_type:'WiFi' }); loadDevices(); }
        else setStatus('Error saving device.');
    };

    const remove = async (id) => {
        if (!confirm('Delete this device?')) return;
        await fetch(`/api/devices/${id}`, { method: 'DELETE', headers, credentials: 'include' });
        loadDevices();
    };

    const sync = async (id) => {
        const r = await fetch(`/api/devices/${id}/sync`, { credentials: 'include' });
        const d = await r.json();
        setStatus(`Synced ${d.synced ?? 0} commands to device.`);
        loadDevices();
        setTimeout(() => setStatus(''), 4000);
    };

    const openEdit = (device) => {
        setForm({ name: device.name, type: device.type, connection_type: device.connection_type });
        setEditId(device.id);
        setModal(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white">Device Manager</h2>}
        >
            <Head title="Devices – NeoPixel Studio" />
            <div className="py-10 max-w-7xl mx-auto px-4">
                {status && <div className="mb-4 bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-lg text-sm">{status}</div>}

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold dark:text-white text-gray-800">Your LED Devices</h3>
                    <button onClick={() => { setModal(true); setEditId(null); }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow">
                        + Add Device
                    </button>
                </div>

                {devices.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">💡</div>
                        <p>No devices yet. Add your first LED device!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map(device => (
                            <div key={device.id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow hover:shadow-lg transition relative overflow-hidden">
                                <span className={`absolute top-0 right-0 w-2 h-full ${device.status === 'online' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                <h4 className="text-xl font-black text-gray-800 dark:text-white mb-1">{device.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-1">{device.type}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">🔌 {device.connection_type}</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${device.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {device.status?.toUpperCase()}
                                    </span>
                                    {device.last_seen && <span className="text-xs text-gray-400">Seen: {new Date(device.last_seen).toLocaleTimeString()}</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(device)}
                                        className="flex-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition">
                                        Edit
                                    </button>
                                    <button onClick={() => sync(device.id)}
                                        className="flex-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-100 transition">
                                        Sync
                                    </button>
                                    <button onClick={() => remove(device.id)}
                                        className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 rounded-lg font-semibold text-sm hover:bg-red-100 transition">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-black mb-6 text-gray-800 dark:text-white">{editId ? 'Edit Device' : 'Add New Device'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Device Name</label>
                                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Living Room Strip" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Connection</label>
                                    <select value={form.connection_type} onChange={e => setForm({...form, connection_type: e.target.value})}
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        {CONN.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={save}
                                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow">
                                    {editId ? 'Update' : 'Add Device'}
                                </button>
                                <button onClick={() => { setModal(false); setEditId(null); }}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
