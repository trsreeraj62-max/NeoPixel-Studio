import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Admin({ auth }) {
    const [tab, setTab] = useState('stats');
    const [stats, setStats] = useState({ users: 0, devices: 0, animations: 0, online: 0 });
    const [users, setUsers] = useState([]);
    const [deviceLogs, setDeviceLogs] = useState([]);
    const [promptLogs, setPromptLogs] = useState([]);

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
    };

    useEffect(() => {
        fetch('/api/admin/stats', { headers, credentials: 'include' }).then(r => r.ok && r.json()).then(d => d && setStats(d));
    }, []);

    useEffect(() => {
        if (tab === 'users') fetch('/api/admin/users', { headers, credentials: 'include' }).then(r => r.json()).then(setUsers);
        if (tab === 'device_logs') fetch('/api/admin/logs/devices', { headers, credentials: 'include' }).then(r => r.json()).then(setDeviceLogs);
        if (tab === 'prompt_logs') fetch('/api/admin/logs/prompts', { headers, credentials: 'include' }).then(r => r.json()).then(setPromptLogs);
    }, [tab]);

    const deleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers, credentials: 'include' });
        setUsers(u => u.filter(x => x.id !== id));
    };

    const setRole = async (id, role) => {
        await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ role }) });
        setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    };

    const tabs = [
        { key: 'stats',       label: '📊 Dashboard' },
        { key: 'users',       label: '👥 Users' },
        { key: 'device_logs', label: '📋 Device Logs' },
        { key: 'prompt_logs', label: '🤖 AI Logs' },
    ];

    if (auth.user.role !== 'admin') {
        return (
            <AuthenticatedLayout user={auth.user} header={<h2>Admin Panel</h2>}>
                <div className="py-20 text-center text-red-500 font-bold text-xl">Access Denied — Admins Only</div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white">🔰 Admin Panel</h2>}>
            <Head title="Admin – NeoPixel Studio" />
            <div className="py-8 max-w-7xl mx-auto px-4">

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                {tab === 'stats' && (
                    <div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Users',    val: stats.users,      icon: '👤', color: 'border-t-4 border-indigo-500' },
                                { label: 'Total Devices',  val: stats.devices,    icon: '💡', color: 'border-t-4 border-amber-500' },
                                { label: 'Animations',     val: stats.animations, icon: '🎬', color: 'border-t-4 border-purple-500' },
                                { label: 'Online Devices', val: stats.online,     icon: '🟢', color: 'border-t-4 border-emerald-500' },
                            ].map(s => (
                                <div key={s.label} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow ${s.color}`}>
                                    <div className="text-3xl mb-2">{s.icon}</div>
                                    <div className="text-4xl font-black text-gray-800 dark:text-white">{s.val}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">System Alerts</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                                    ℹ️ All systems operational. WebSocket channel active.
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm">
                                    ⚠️ Offline command queue has {stats.devices} device(s) pending sync.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users */}
                {tab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>{['ID','Name','Email','Role','Joined','Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-gray-500">#{u.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{u.name}</td>
                                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <select value={u.role}
                                                onChange={e => setRole(u.id, e.target.value)}
                                                className="text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1">
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            {u.id !== auth.user.id && (
                                                <button onClick={() => deleteUser(u.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="text-center py-8 text-gray-400">No users found.</div>}
                    </div>
                )}

                {/* Device Logs */}
                {tab === 'device_logs' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>{['Device','Event','Details','Time'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {deviceLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium dark:text-white">{log.device?.name ?? `#${log.device_id}`}</td>
                                        <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">{log.event}</span></td>
                                        <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{log.details}</td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {deviceLogs.length === 0 && <div className="text-center py-8 text-gray-400">No device logs yet.</div>}
                    </div>
                )}

                {/* Prompt Logs */}
                {tab === 'prompt_logs' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <tr>{['User','Prompt','Status','Time'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {promptLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 font-medium dark:text-white">{log.user?.name ?? `#${log.user_id}`}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{log.prompt}</td>
                                        <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span></td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {promptLogs.length === 0 && <div className="text-center py-8 text-gray-400">No AI prompt logs yet.</div>}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
