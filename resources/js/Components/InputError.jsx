export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-xs font-bold text-neon-pink uppercase tracking-widest ' + className}
        >
            {message}
        </p>
    ) : null;
}
