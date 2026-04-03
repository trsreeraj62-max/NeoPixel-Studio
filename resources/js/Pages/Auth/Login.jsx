import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Access Studio - NeoPixel" />

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-white tracking-tight">WELCOME BACK MASTER</h2>
                <p className="text-xs text-[#E0E0FF]/40 font-bold uppercase tracking-widest mt-1">Initialize your pixel empire</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-bold text-neon-blue bg-neon-blue/10 p-3 rounded-lg border border-neon-blue/20">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Commander Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="your@studio.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Access Key" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center group cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs font-bold text-[#E0E0FF]/50 uppercase tracking-widest transition-colors group-hover:text-neon-blue">
                            Stay Synchronized
                        </span>
                    </label>
                    
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-[10px] font-black text-neon-purple uppercase tracking-widest transition-colors hover:text-white"
                        >
                            Lost Access Code?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full" disabled={processing}>
                        AUTHORIZE ENTRY
                    </PrimaryButton>
                    
                    <div className="mt-6 text-center">
                        <span className="text-[10px] font-bold text-[#E0E0FF]/30 uppercase tracking-[0.15em]">New Creator? </span>
                        <Link href={route('register')} className="text-[10px] font-black text-neon-blue uppercase tracking-widest ml-1 hover:underline">
                            CREATE PORTAL
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}

