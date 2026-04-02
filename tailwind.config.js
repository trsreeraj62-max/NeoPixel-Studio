import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                neon: {
                    purple: '#b04aff',
                    blue:   '#00d4ff',
                    pink:   '#ff4dac',
                },
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
            },
        },
    },

    plugins: [forms],
};
