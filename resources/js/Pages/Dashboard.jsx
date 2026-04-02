import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    const [stats, setStats] = useState({ users: 0, devices: 0, animations: 0, online: 0 });
    const [theme, setTheme] = useState(localStorage.getItem('neopixel_theme') || 'light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('neopixel_theme', theme);
    }, [theme]);

    const cards = [
        { label: 'Animations', value: stats.animations, icon: '🎬', color: 'from-purple-500 to-indigo-600' },
        { label: 'Devices', value: stats.devices, icon: '💡', color: 'from-amber-500 to-orange-600' },
        { label: 'Online Now', value: stats.online, icon: '🟢', color: 'from-emerald-400 to-teal-600' },
        { label: 'Users', value: stats.users, icon: '👤', color: 'from-pink-500 to-rose-600' },
    ];

    return (
        <AuthenticatedLayout user={auth.user} theme={theme} setTheme={setTheme}
            header={<h2 className="font-semibold text-xl">Dashboard</h2>}
        >
            <Head title="Dashboard – NeoPixel Studio" />
            <div className="py-10 px-4 max-w-7xl mx-auto">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {cards.map(c => (
                        <div key={c.label}
                            className={`bg-gradient-to-br ${c.color} rounded-2xl p-6 text-white shadow-lg flex flex-col items-start gap-2`}>
                            <span className="text-3xl">{c.icon}</span>
                            <div className="text-4xl font-black">{c.value}</div>
                            <div className="text-sm font-medium opacity-80 uppercase tracking-widest">{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 dark:text-white text-gray-800">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { href: '/editor', label: '✏️ Open LED Editor', desc: 'Create & edit animations', color: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' },
                            { href: '/devices', label: '💡 Manage Devices', desc: 'Add, sync, control devices', color: 'border-amber-400 bg-amber-50 dark:bg-amber-900/30' },
                            { href: '/admin', label: '🔰 Admin Panel', desc: 'Users, logs, analytics', color: 'border-rose-400 bg-rose-50 dark:bg-rose-900/30' },
                        ].map(a => (
                            <Link key={a.href} href={a.href}
                                className={`border-2 rounded-xl p-5 ${a.color} hover:shadow-md transition group`}>
                                <div className="text-base font-bold text-gray-800 dark:text-white group-hover:underline">{a.label}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">{a.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Live Preview Teaser */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-300 uppercase tracking-widest">Live Simulation Preview</h3>
                        <Link href="/editor" className="text-indigo-400 text-sm hover:underline">Open Editor →</Link>
                    </div>
                    <div className="grid grid-cols-16 gap-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: '3px' }}>
                        {Array.from({ length: 64 }, (_, i) => {
                            const hue = (i * 20) % 360;
                            return <div key={i} className="rounded-sm aspect-square"
                                style={{ backgroundColor: `hsl(${hue},100%,50%)`, boxShadow: `0 0 4px hsl(${hue},100%,40%)` }} />;
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
