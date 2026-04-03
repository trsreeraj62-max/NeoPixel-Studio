import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="NeoPixel Studio - The Future of LED Animation" />
            
            <div className="min-h-screen bg-[#050510] text-[#E0E0FF] font-sans selection:bg-neon-purple selection:text-white overflow-hidden relative">
                {/* ── Background Grains & Glows ── */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/20 blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-neon-blue/20 blur-[150px] animate-pulse delay-700"></div>
                </div>

                {/* ── Navbar ── */}
                <nav className="relative z-50 flex flex-wrap items-center justify-between px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-4 lg:mx-auto backdrop-blur-md bg-white/5 border-b border-white/10 mt-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-purple to-neon-blue flex items-center justify-center shadow-[0_0_15px_rgba(176,74,255,0.5)]">
                            <span className="font-black text-xl text-white italic">N</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C0C0F0] to-neon-blue">
                            NEOPIXEL <span className="text-neon-purple font-medium tracking-normal ml-0.5">STUDIO</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6 text-sm font-semibold opacity-70">
                            <a href="#features" className="hover:text-neon-blue transition-colors">Features</a>
                            <a href="#editor"   className="hover:text-neon-purple transition-colors">AI Editor</a>
                            <a href="#hardware" className="hover:text-neon-pink transition-colors">Hardware</a>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-6 py-2 rounded-full border border-neon-blue text-neon-blue hover:bg-neon-blue/10 transition-all font-bold text-sm shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                                >
                                    GO TO STUDIO
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold hover:text-neon-blue transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
                                    >
                                        JOIN NOW
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* ── Hero Section ── */}
                <main className="relative z-10 pt-20 pb-32">
                    <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[#B0B0C0]">
                                <span className="text-neon-pink mr-2">●</span> NEXT GENERATION LED CONTROL
                            </div>
                            
                            <h1 className="text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight">
                                UNLEASH <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink animate-gradient-x">PURE LIGHT</span>
                            </h1>
                            
                            <p className="text-lg text-[#B0B0C4] max-w-lg leading-relaxed font-medium">
                                Create stunning LED animations with AI-powered prompt control, synchronized over wireless clusters, and built with a premium interface for masters of pixels.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                                <Link
                                    href={route('register')}
                                    className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-white text-black font-black rounded-lg overflow-hidden transition-all hover:pr-12 sm:hover:pr-14"
                                >
                                    <span className="relative z-10 whitespace-nowrap">START FOR FREE</span>
                                    <span className="absolute right-[-20px] group-hover:right-3 transition-all duration-300">→</span>
                                </Link>
                                <a href="#features" className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white/10 border border-white/20 font-bold hover:bg-white/15 transition-all text-center whitespace-nowrap text-sm sm:text-base cursor-pointer">
                                    SEE IN ACTION
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center justify-start gap-8 sm:gap-12 pt-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl font-black">200+</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Supported Controllers</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl font-black">10K</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Active Devices</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl font-black">0.5ms</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Global Latency</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            {/* Decorative Frame */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            
                            <div className="relative bg-[#0A0A1F] rounded-[22px] border border-white/10 overflow-hidden shadow-2xl">
                                {/* Simulated Mockup Header */}
                                <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-1.5">
                                    <div className="size-2 rounded-full bg-[#FF5F57]"></div>
                                    <div className="size-2 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="size-2 rounded-full bg-[#28C840]"></div>
                                    <div className="ml-2 text-[10px] font-bold tracking-widest opacity-30">NEOPIXEL EDITOR v2.0</div>
                                </div>
                                
                                {/* Image Content */}
                                <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#B04AFF40_0%,_transparent_70%)] animate-pulse"></div>
                                    {/* Placeholder for Editor Preview */}
                                    <div className="relative grid grid-cols-12 grid-rows-12 gap-1 w-full h-full p-4">
                                        {[...Array(144)].map((_, i) => (
                                            <div key={i} className="rounded-[1px] opacity-20 border border-white/5 bg-white/5"></div>
                                        ))}
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                                            <div className="px-4 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-center shadow-2xl">
                                                <div className="text-xs font-bold text-neon-blue mb-1">PROMPT ACTIVE</div>
                                                <div className="text-[10px] opacity-70 italic font-medium">"Cinematic purple pulse wave..."</div>
                                            </div>
                                            <div className="w-[80%] h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="w-[60%] h-full bg-gradient-to-r from-neon-purple to-neon-blue animate-[progress_2s_ease-in-out_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="relative z-10 border-t border-white/5 py-12">
                    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-xs font-medium opacity-40">
                            © 2026 NEOPIXEL STUDIO. BUILT FOR THE NEON FUTURE.
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold tracking-widest opacity-60">
                            <a href="#" className="hover:text-neon-purple transition-all underline underline-offset-4">TWITTER</a>
                            <a href="#" className="hover:text-neon-blue transition-all underline underline-offset-4">DISCORD</a>
                            <a href="#" className="hover:text-neon-pink transition-all underline underline-offset-4">GITHUB</a>
                        </div>
                    </div>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-move 10s ease infinite;
                }
                @keyframes gradient-move {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}} />
        </>
    );
}

