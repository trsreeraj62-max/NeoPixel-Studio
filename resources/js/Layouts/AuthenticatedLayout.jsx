import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('neopixel_theme') || 'light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('neopixel_theme', theme);
        
        // Persist to backend if possible
        if (user) {
            fetch('/api/settings/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                body: JSON.stringify({ theme }),
                credentials: 'include'
            }).catch(e => console.log('Theme sync failed', e));
        }
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    const navLinks = [
        { href: route('dashboard'), name: 'dashboard', label: 'Dashboard' },
        { href: route('devices'),   name: 'devices',   label: '💡 Devices' },
        { href: route('editor'),    name: 'editor',    label: '🎨 Editor' },
        { href: route('chat'),      name: 'chat',      label: '🤖 AI Chat' },
        { href: route('admin'),     name: 'admin',     label: '🔰 Admin' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo + Nav */}
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2 shrink-0">
                                <span className="text-2xl">💠</span>
                                <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg tracking-tight hidden sm:block">NeoPixel Studio</span>
                            </Link>
                            <div className="hidden sm:flex gap-1">
                                {navLinks.map(n => (
                                    <NavLink key={n.name} href={n.href} active={route().current(n.name)}
                                        className="text-sm">
                                        {n.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Right side: dark mode + user */}
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-lg"
                                title="Toggle dark/light mode">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>

                            {/* User Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button"
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                                        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                        {user.name}
                                        {user.role === 'admin' && <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full font-bold">Admin</span>}
                                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center gap-2 sm:hidden">
                            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-base">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <button onClick={() => setShowingNavigationDropdown(p => !p)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-gray-200 dark:border-gray-700'}>
                    <div className="space-y-1 pb-3 pt-2 px-4">
                        {navLinks.map(n => (
                            <ResponsiveNavLink key={n.name} href={n.href} active={route().current(n.name)}>
                                {n.label}
                            </ResponsiveNavLink>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4 px-4">
                        <div className="text-base font-medium text-gray-800 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
