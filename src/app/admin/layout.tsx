import { AppSwitcher } from '@/components/AppSwitcher';
import { Sidebar } from '../../components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full flex flex-col bg-adm-bg overflow-hidden text-adm-text antialiased pt-12">
            <AppSwitcher />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-adm-bg" style={{ scrollbarWidth: 'thin' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
