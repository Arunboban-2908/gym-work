export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-adm-bg relative overflow-hidden font-sora">
            {/* Ambient glow effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-adm-accent/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-adm-teal/8 blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo / App title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-adm-text tracking-tight">
                        Neuro<span className="text-adm-accent">Path</span>
                    </h1>
                    <p className="text-adm-muted text-sm mt-1.5">
                        SCI Rehabilitation Platform
                    </p>
                </div>

                {/* Glassmorphic card */}
                <div className="backdrop-blur-xl bg-adm-surface/60 border border-adm-border rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-adm-muted/50 mt-6">
                    &copy; {new Date().getFullYear()} NeuroPath &middot; Clinical Platform v1.0
                </p>
            </div>
        </div>
    );
}
