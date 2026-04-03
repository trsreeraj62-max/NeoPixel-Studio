import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg bg-white/5 border-white/20 text-[#E0E0FF] shadow-sm transition-all focus:border-neon-purple focus:ring-neon-purple focus:bg-white/10 placeholder:text-white/20 ' +
                className
            }
            ref={localRef}
        />
    );
});

