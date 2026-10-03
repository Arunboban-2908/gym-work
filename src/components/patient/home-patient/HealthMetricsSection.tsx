import React, { useState } from 'react';
import { Section, HealthMetric } from './ui-blocks';
import { useToast } from '@/components/ui/Toast';

interface HealthMetricsSectionProps {
    onSync?: () => void; // Keeping prop for backwards compatibility but overriding action
}

export function HealthMetricsSection({ onSync }: HealthMetricsSectionProps) {
    const [heartRate, setHeartRate] = useState<number | string>("72");
    const [steps, setSteps] = useState<number | string>("47");
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();

    const handleBluetoothSync = async () => {
        try {
            setIsSyncing(true);
            toast('Requesting Bluetooth device...', 'info');

            // Web Bluetooth API - MUST be called by a user gesture
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [{ services: ['heart_rate'] }] // Standard GATT Heart Rate Service
            });
            
            toast(`Connecting to ${device.name}...`, 'info');
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService('heart_rate');
            const characteristic = await service.getCharacteristic('heart_rate_measurement');
            
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (e: any) => {
                const val = e.target.value;
                // Standard parsing for Heart Rate Measurement characteristic
                const hr = val.getUint8(1); 
                setHeartRate(hr);
                
                // For MVP demo: Simulate steps/active minutes going up
                setSteps(prev => typeof prev === 'number' ? prev + 1 : 48);
            });

            toast(`Successfully paired with ${device.name}!`, 'success');

        } catch (error: any) {
            if (error.name === 'NotFoundError' || error.message?.toLowerCase().includes('cancel')) {
                toast('Sync cancelled', 'info');
                return;
            }

            console.error("Bluetooth sync error:", error);


            // Fallback Simulation for MVP purposes if user doesn't have a BLE device handy
            toast('No device found. Simulating Bluetooth sync for demo...', 'info');
            setHeartRate(Math.floor(Math.random() * 20) + 70); // Random 70-90
            setSteps(Math.floor(Math.random() * 15) + 45); // Random 45-60
        } finally {
            setIsSyncing(false);
            if (onSync) onSync();
        }
    };

    return (
        <Section title="Today's Health" action={isSyncing ? "Syncing..." : "Sync ↻"} onAction={handleBluetoothSync}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3 mb-3 lg:mb-5">
                <HealthMetric icon="❤️" label="Heart Rate" value={heartRate.toString()} unit="bpm" trend={typeof heartRate === 'number' && heartRate > 80 ? "↑ Elevated" : "↓ Normal"} trendColor={typeof heartRate === 'number' && heartRate > 80 ? "text-amber-500" : "text-green-600"} bg="bg-red-100" />
                <HealthMetric icon="💧" label="SpO₂" value="98" unit="%" trend="↑ Excellent" trendColor="text-green-600" bg="bg-blue-100" />
                <HealthMetric icon="🏃" label="Active Today" value={steps.toString()} unit="min" trend="→ On track" trendColor="text-blue-600" bg="bg-green-100" />
                <HealthMetric icon="😴" label="Sleep" value="7.2" unit="hrs" trend="↑ Good" trendColor="text-green-600" bg="bg-amber-100" />
            </div>
        </Section>
    );
}
