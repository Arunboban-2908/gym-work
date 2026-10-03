import { PatientNav } from '@/components/patient/PatientNav';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden text-adm-text antialiased font-sora bg-pat-bg">
        <div className="w-full h-full bg-pat-bg overflow-hidden flex flex-col-reverse md:flex-row relative font-sora">
            <PatientNav />
            <div className="flex-1 relative overflow-hidden bg-pat-bg flex flex-col">
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col w-full">
                    {children}
                </div>
            </div>
        </div>
    </div>
  );
}
