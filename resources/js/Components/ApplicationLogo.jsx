export default function ApplicationLogo(props) {
    return (
        <div {...props} className={`flex items-center justify-center ${props.className}`}>
            <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink rounded-xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                <div className="relative bg-black w-14 h-14 rounded-xl flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                    <span className="font-black text-3xl text-white italic tracking-tighter leading-none select-none">N</span>
                </div>
            </div>
        </div>
    );
}

