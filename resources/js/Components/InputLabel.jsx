export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold uppercase tracking-widest text-[#E0E0FF]/70 mb-1 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}

