import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#050510] pt-6 sm:justify-center sm:pt-0 relative overflow-hidden">
            {/* ── Background Glows ── */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/20 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-neon-blue/20 blur-[150px]"></div>
            </div>

            <div className="relative z-10">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20" />
                </Link>
            </div>

            <div className="relative z-10 mt-8 w-full overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-10 shadow-2xl sm:max-w-md sm:rounded-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink"></div>
                {children}
            </div>
            
            <div className="relative z-10 mt-8 text-center">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#E0E0FF]/30 uppercase">
                    Secure Entry Portal // NeoPixel Studio v2.0
                </p>
            </div>
        </div>
    );
}

