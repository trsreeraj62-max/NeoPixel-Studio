export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-neon-purple to-neon-blue px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(176,74,255,0.4)] focus:outline-none disabled:opacity-50 ` +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

