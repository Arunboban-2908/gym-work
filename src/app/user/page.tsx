import { PatientHome } from '@/components/patient/PatientHome';
import { getCurrentPatientProfile } from '@/actions/patient';

export default async function UserHomePage() {
    const res = await getCurrentPatientProfile();
    const patient = res.success ? res.data : null;

    if (!patient) {
        return (
            <div className="flex items-center justify-center h-full text-pat-muted flex-col gap-2">
                <p>No patient profile found.</p>
                <p className="text-xs">Please register a patient in the admin panel first.</p>
            </div>
        );
    }

    return <PatientHome patient={patient} />;
}
