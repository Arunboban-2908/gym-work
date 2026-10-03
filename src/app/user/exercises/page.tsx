import { PatientExercises } from '@/components/patient/PatientExercises';
import { getCurrentPatientProfile } from '@/actions/patient';

export default async function ExercisesPage() {
    const res = await getCurrentPatientProfile();
    const patient = res.success ? res.data : null;

    if (!patient) {
        return <div className="p-8 text-center text-pat-muted">No patient found.</div>;
    }

    return <PatientExercises assignedExercises={patient.assignedExercises || []} />;
}
