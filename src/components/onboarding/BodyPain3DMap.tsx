'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Compass, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';
import { OnboardingPainItem } from '@/actions/onboarding';

interface BodyRegionDef {
    id: string;
    name: string;
    category: 'Joint' | 'Muscle' | 'Bone';
    position: [number, number, number];
    geometry: 'sphere' | 'cylinder' | 'capsule' | 'box';
    args: [number, number, number]; // params for geometry
    rotation?: [number, number, number];
}

const BODY_REGIONS: BodyRegionDef[] = [
    // Head & Neck
    { id: 'head', name: 'Head / Cranium', category: 'Bone', position: [0, 4.3, 0], geometry: 'sphere', args: [0.65, 16, 16] },
    { id: 'neck', name: 'Neck / Cervical Spine', category: 'Joint', position: [0, 3.45, 0], geometry: 'cylinder', args: [0.35, 0.4, 0.6] },
    
    // Torso
    { id: 'chest', name: 'Chest / Thoracic Spine', category: 'Muscle', position: [0, 2.65, 0.1], geometry: 'box', args: [1.6, 0.9, 0.8] },
    { id: 'abdomen', name: 'Abdomen / Core', category: 'Muscle', position: [0, 1.85, 0.05], geometry: 'box', args: [1.3, 0.7, 0.7] },
    { id: 'lower_back', name: 'Lower Back / Lumbar', category: 'Muscle', position: [0, 1.75, -0.2], geometry: 'box', args: [1.3, 0.8, 0.6] },
    { id: 'pelvis', name: 'Pelvis / Hips', category: 'Joint', position: [0, 1.15, 0], geometry: 'box', args: [1.5, 0.7, 0.8] },

    // Left Arm
    { id: 'left_shoulder', name: 'Left Shoulder', category: 'Joint', position: [1.1, 2.9, 0], geometry: 'sphere', args: [0.38, 16, 16] },
    { id: 'left_arm', name: 'Left Upper Arm', category: 'Muscle', position: [1.35, 2.2, 0], geometry: 'cylinder', args: [0.26, 0.23, 0.9] },
    { id: 'left_elbow', name: 'Left Elbow', category: 'Joint', position: [1.45, 1.6, 0], geometry: 'sphere', args: [0.28, 16, 16] },
    { id: 'left_forearm', name: 'Left Forearm', category: 'Muscle', position: [1.55, 1.05, 0], geometry: 'cylinder', args: [0.22, 0.19, 0.8] },
    { id: 'left_wrist_hand', name: 'Left Wrist / Hand', category: 'Joint', position: [1.65, 0.5, 0], geometry: 'sphere', args: [0.25, 16, 16] },

    // Right Arm
    { id: 'right_shoulder', name: 'Right Shoulder', category: 'Joint', position: [-1.1, 2.9, 0], geometry: 'sphere', args: [0.38, 16, 16] },
    { id: 'right_arm', name: 'Right Upper Arm', category: 'Muscle', position: [-1.35, 2.2, 0], geometry: 'cylinder', args: [0.26, 0.23, 0.9] },
    { id: 'right_elbow', name: 'Right Elbow', category: 'Joint', position: [-1.45, 1.6, 0], geometry: 'sphere', args: [0.28, 16, 16] },
    { id: 'right_forearm', name: 'Right Forearm', category: 'Muscle', position: [-1.55, 1.05, 0], geometry: 'cylinder', args: [0.22, 0.19, 0.8] },
    { id: 'right_wrist_hand', name: 'Right Wrist / Hand', category: 'Joint', position: [-1.65, 0.5, 0], geometry: 'sphere', args: [0.25, 16, 16] },

    // Left Leg
    { id: 'left_hip', name: 'Left Hip', category: 'Joint', position: [0.55, 0.7, 0], geometry: 'sphere', args: [0.36, 16, 16] },
    { id: 'left_thigh', name: 'Left Thigh', category: 'Muscle', position: [0.55, -0.2, 0], geometry: 'cylinder', args: [0.36, 0.3, 1.3] },
    { id: 'left_knee', name: 'Left Knee', category: 'Joint', position: [0.55, -1.0, 0.05], geometry: 'sphere', args: [0.34, 16, 16] },
    { id: 'left_shin_calf', name: 'Left Shin / Calf', category: 'Muscle', position: [0.55, -1.9, 0], geometry: 'cylinder', args: [0.28, 0.23, 1.3] },
    { id: 'left_ankle_foot', name: 'Left Ankle / Foot', category: 'Joint', position: [0.55, -2.8, 0.15], geometry: 'box', args: [0.35, 0.35, 0.7] },

    // Right Leg
    { id: 'right_hip', name: 'Right Hip', category: 'Joint', position: [-0.55, 0.7, 0], geometry: 'sphere', args: [0.36, 16, 16] },
    { id: 'right_thigh', name: 'Right Thigh', category: 'Muscle', position: [-0.55, -0.2, 0], geometry: 'cylinder', args: [0.36, 0.3, 1.3] },
    { id: 'right_knee', name: 'Right Knee', category: 'Joint', position: [-0.55, -1.0, 0.05], geometry: 'sphere', args: [0.34, 16, 16] },
    { id: 'right_shin_calf', name: 'Right Shin / Calf', category: 'Muscle', position: [-0.55, -1.9, 0], geometry: 'cylinder', args: [0.28, 0.23, 1.3] },
    { id: 'right_ankle_foot', name: 'Right Ankle / Foot', category: 'Joint', position: [-0.55, -2.8, 0.15], geometry: 'box', args: [0.35, 0.35, 0.7] },
];

interface BodyPain3DMapProps {
    painLocations: OnboardingPainItem[];
    onChange: (locations: OnboardingPainItem[]) => void;
}

export function BodyPain3DMap({ painLocations, onChange }: BodyPain3DMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedRegion, setSelectedRegion] = useState<BodyRegionDef>(BODY_REGIONS[17]); // default Right Knee
    const [activePainType, setActivePainType] = useState<'Bone' | 'Joint' | 'Muscle'>('Joint');
    const [severity, setSeverity] = useState<number>(5);
    const [notes, setNotes] = useState<string>('');
    const [hoveredName, setHoveredName] = useState<string | null>(null);

    // References for Three.js state
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const humanGroupRef = useRef<THREE.Group | null>(null);
    const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const isDraggingRef = useRef(false);
    const prevMousePosRef = useRef({ x: 0, y: 0 });
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

    // Sync active inputs if user clicks on already registered location
    useEffect(() => {
        const existing = painLocations.find(p => p.bodyPart === selectedRegion.name);
        if (existing) {
            setActivePainType(existing.painType);
            setSeverity(existing.severity);
            setNotes(existing.notes || '');
        } else {
            setActivePainType(selectedRegion.category);
            setSeverity(5);
            setNotes('');
        }
    }, [selectedRegion, painLocations]);

    // Setup Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = 480;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x0a101d);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.8, 10.5);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rendererRef.current = renderer;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.replaceChildren(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
        dirLight1.position.set(5, 8, 5);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x818cf8, 1.2);
        dirLight2.position.set(-5, -3, -5);
        scene.add(dirLight2);

        // Ground grid
        const grid = new THREE.GridHelper(8, 16, 0x1e293b, 0x0f172a);
        grid.position.y = -3.2;
        scene.add(grid);

        // Human Model Group
        const humanGroup = new THREE.Group();
        humanGroupRef.current = humanGroup;
        scene.add(humanGroup);

        const meshesMap = new Map<string, THREE.Mesh>();
        meshesMapRef.current = meshesMap;

        // Build anatomical segment meshes
        BODY_REGIONS.forEach((region) => {
            let geom: THREE.BufferGeometry;
            if (region.geometry === 'sphere') {
                geom = new THREE.SphereGeometry(region.args[0], region.args[1], region.args[2]);
            } else if (region.geometry === 'cylinder') {
                geom = new THREE.CylinderGeometry(region.args[0], region.args[1], region.args[2], 16);
            } else {
                geom = new THREE.BoxGeometry(region.args[0], region.args[1], region.args[2]);
            }

            const mat = new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.35,
                metalness: 0.6,
                transparent: true,
                opacity: 0.9,
            });

            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(...region.position);
            mesh.userData = { id: region.id, name: region.name, regionDef: region };
            humanGroup.add(mesh);
            meshesMap.set(region.id, mesh);
        });

        // Raycasting setup
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function getPointerPos(e: MouseEvent) {
            const rect = renderer.domElement.getBoundingClientRect();
            return {
                x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
                y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
            };
        }

        const handleMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            prevMousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current && humanGroupRef.current) {
                const deltaX = e.clientX - prevMousePosRef.current.x;
                const deltaY = e.clientY - prevMousePosRef.current.y;
                humanGroupRef.current.rotation.y += deltaX * 0.012;
                humanGroupRef.current.rotation.x = Math.max(-0.5, Math.min(0.5, humanGroupRef.current.rotation.x + deltaY * 0.006));
                prevMousePosRef.current = { x: e.clientX, y: e.clientY };
            } else {
                const pos = getPointerPos(e);
                mouse.x = pos.x;
                mouse.y = pos.y;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(humanGroup.children);
                if (intersects.length > 0) {
                    const hit = intersects[0].object as THREE.Mesh;
                    setHoveredName(hit.userData.name);
                    containerRef.current!.style.cursor = 'pointer';
                } else {
                    setHoveredName(null);
                    containerRef.current!.style.cursor = 'grab';
                }
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            const movedDist = Math.hypot(e.clientX - prevMousePosRef.current.x, e.clientY - prevMousePosRef.current.y);
            isDraggingRef.current = false;

            // Only trigger click selection if not a significant drag
            if (movedDist < 5) {
                const pos = getPointerPos(e);
                mouse.x = pos.x;
                mouse.y = pos.y;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(humanGroup.children);
                if (intersects.length > 0) {
                    const hit = intersects[0].object as THREE.Mesh;
                    const region = hit.userData.regionDef as BodyRegionDef;
                    if (region) {
                        setSelectedRegion(region);
                    }
                }
            }
        };

        const domElem = renderer.domElement;
        domElem.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Render loop
        let reqId: number;
        const animate = () => {
            reqId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
            const newW = containerRef.current.clientWidth;
            cameraRef.current.aspect = newW / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(newW, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(reqId);
            domElem.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);

    // Update 3D materials dynamically when painLocations or selectedRegion changes
    useEffect(() => {
        if (!meshesMapRef.current) return;

        BODY_REGIONS.forEach((region) => {
            const mesh = meshesMapRef.current.get(region.id);
            if (!mesh) return;

            const isSelected = selectedRegion.id === region.id;
            const recordedItem = painLocations.find(p => p.bodyPart === region.name);

            const mat = mesh.material as THREE.MeshStandardMaterial;

            if (isSelected) {
                // Highlighted currently selected region
                mat.color.setHex(0x0ea5e9); // Bright sky blue
                mat.emissive.setHex(0x0284c7);
                mat.emissiveIntensity = 0.5;
            } else if (recordedItem) {
                // Color code by severity (mild: green/amber, severe: red/crimson)
                if (recordedItem.severity >= 7) {
                    mat.color.setHex(0xef4444); // Red
                    mat.emissive.setHex(0x991b1b);
                } else if (recordedItem.severity >= 4) {
                    mat.color.setHex(0xf59e0b); // Amber
                    mat.emissive.setHex(0x78350f);
                } else {
                    mat.color.setHex(0x10b981); // Emerald
                    mat.emissive.setHex(0x064e3b);
                }
                mat.emissiveIntensity = 0.4;
            } else {
                // Default anatomical metallic skin
                mat.color.setHex(0x334155);
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
            }
        });
    }, [painLocations, selectedRegion]);

    // View helper controls
    const rotateTo = (targetY: number) => {
        if (humanGroupRef.current) {
            humanGroupRef.current.rotation.y = targetY;
            humanGroupRef.current.rotation.x = 0;
        }
    };

    const zoomCamera = (delta: number) => {
        if (cameraRef.current) {
            cameraRef.current.position.z = Math.max(6, Math.min(15, cameraRef.current.position.z + delta));
        }
    };

    const handleAddOrUpdatePain = () => {
        const existingIdx = painLocations.findIndex(p => p.bodyPart === selectedRegion.name);
        const newItem: OnboardingPainItem = {
            bodyPart: selectedRegion.name,
            painType: activePainType,
            severity,
            notes: notes.trim() || undefined,
        };

        if (existingIdx >= 0) {
            const updated = [...painLocations];
            updated[existingIdx] = newItem;
            onChange(updated);
        } else {
            onChange([...painLocations, newItem]);
        }
    };

    const handleRemovePain = (bodyPart: string) => {
        onChange(painLocations.filter(p => p.bodyPart !== bodyPart));
    };

    const isCurrentRecorded = painLocations.some(p => p.bodyPart === selectedRegion.name);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h3 className="text-base font-bold text-adm-text">3D Interactive Pain Mapping</h3>
                    <p className="text-xs text-adm-muted mt-0.5">
                        Rotate and click on specific body parts to locate any pain, soreness, or injury.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 bg-adm-surface px-2.5 py-1 rounded-lg border border-adm-border text-11 text-adm-muted">
                    <Info size={13} className="text-adm-accent" />
                    <span>Self-reported pain mapping</span>
                </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 3D Viewport Box */}
                <div className="lg:col-span-7 bg-[#0a101d] border border-adm-border/80 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col items-center">
                    {/* View Controls Toolbar */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 text-xs">
                        <button
                            type="button"
                            onClick={() => rotateTo(0)}
                            className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/80 font-medium transition-colors cursor-pointer"
                        >
                            Front
                        </button>
                        <button
                            type="button"
                            onClick={() => rotateTo(Math.PI)}
                            className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/80 font-medium transition-colors cursor-pointer"
                        >
                            Back
                        </button>
                        <div className="h-4 w-[1px] bg-white/20 mx-1" />
                        <button
                            type="button"
                            onClick={() => zoomCamera(-1.2)}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                            title="Zoom In"
                        >
                            <ZoomIn size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => zoomCamera(1.2)}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                            title="Zoom Out"
                        >
                            <ZoomOut size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => rotateTo(0)}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                            title="Reset View"
                        >
                            <Compass size={15} />
                        </button>
                    </div>

                    {/* Hover Tooltip Overlay */}
                    <div className="absolute top-3 right-3 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-cyan-400">
                        {hoveredName ? `Target: ${hoveredName}` : 'Drag to rotate • Click body region'}
                    </div>

                    {/* Three.js Canvas Container */}
                    <div ref={containerRef} className="w-full h-[480px] cursor-grab active:cursor-grabbing" />

                    {/* Quick Region Selector Chips for fast navigation */}
                    <div className="w-full p-2.5 bg-slate-950/70 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto text-10 custom-scrollbar">
                        <span className="text-adm-muted shrink-0 px-2 font-mono uppercase">Quick Select:</span>
                        {BODY_REGIONS.slice(0, 10).map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setSelectedRegion(r)}
                                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer font-medium ${
                                    selectedRegion.id === r.id
                                        ? 'bg-adm-accent text-white font-bold shadow-md shadow-adm-accent/30'
                                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                                }`}
                            >
                                {r.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pain Configuration Panel for Selected Region */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="bg-adm-card border border-adm-border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-adm-border pb-3 mb-4">
                            <div>
                                <span className="text-10 font-bold uppercase tracking-wider text-adm-accent">Selected Body Part</span>
                                <h4 className="text-lg font-bold text-adm-text mt-0.5">{selectedRegion.name}</h4>
                            </div>
                            <span className="text-11 px-2.5 py-1 rounded-full bg-adm-surface border border-adm-border text-adm-muted">
                                {selectedRegion.category} Region
                            </span>
                        </div>

                        {/* Pain Type Selector */}
                        <div className="space-y-1.5 mb-4">
                            <label className="text-xs font-semibold text-adm-muted uppercase tracking-wider block">
                                Pain Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Bone', 'Joint', 'Muscle'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setActivePainType(t)}
                                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                            activePainType === t
                                                ? 'bg-adm-accent/15 border-adm-accent text-adm-accent font-bold shadow-sm'
                                                : 'bg-adm-surface border-adm-border text-adm-muted hover:text-adm-text'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Severity Slider */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center text-xs">
                                <label className="font-semibold text-adm-muted uppercase tracking-wider">
                                    Pain Severity
                                </label>
                                <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                                    severity >= 7 ? 'text-red-400 bg-red-400/10' :
                                    severity >= 4 ? 'text-amber-400 bg-amber-400/10' :
                                    'text-emerald-400 bg-emerald-400/10'
                                }`}>
                                    {severity} / 10
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={10}
                                step={1}
                                value={severity}
                                onChange={(e) => setSeverity(parseInt(e.target.value))}
                                className="w-full h-2 bg-adm-surface rounded-lg appearance-none cursor-pointer accent-adm-accent"
                            />
                            <div className="flex justify-between text-9 text-adm-muted font-mono">
                                <span>0 (No pain)</span>
                                <span>5 (Moderate)</span>
                                <span>10 (Severe)</span>
                            </div>
                        </div>

                        {/* Optional Notes */}
                        <div className="space-y-1.5 mb-5">
                            <label className="text-xs font-semibold text-adm-muted uppercase tracking-wider block">
                                Additional Notes (Optional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. sharp pain when bending, stiffness in morning"
                                className="w-full px-3 py-2 text-xs rounded-xl bg-adm-surface border border-adm-border text-adm-text placeholder-adm-muted/50 focus:outline-none focus:border-adm-accent transition-colors"
                            />
                        </div>

                        {/* Action Button */}
                        <button
                            type="button"
                            onClick={handleAddOrUpdatePain}
                            className="w-full py-2.5 rounded-xl bg-adm-accent hover:brightness-110 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-adm-accent/20"
                        >
                            {isCurrentRecorded ? (
                                <>
                                    <CheckCircle2 size={15} />
                                    <span>Update Pain Information</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={15} />
                                    <span>Record Pain at {selectedRegion.name}</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Recorded Pain Points List */}
                    <div className="bg-adm-card border border-adm-border rounded-2xl p-4 flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-adm-text uppercase tracking-wider">
                                Recorded Pain Points ({painLocations.length})
                            </span>
                            {painLocations.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onChange([])}
                                    className="text-10 text-adm-danger hover:underline cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {painLocations.length === 0 ? (
                            <div className="py-6 text-center text-adm-muted text-xs bg-adm-surface/50 border border-dashed border-adm-border/60 rounded-xl">
                                No pain locations recorded.
                                <p className="text-10 text-adm-muted/70 mt-1">
                                    If you have no pain, you may proceed to the next step.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
                                {painLocations.map((item) => (
                                    <div
                                        key={item.bodyPart}
                                        className="flex items-center justify-between p-2.5 rounded-xl bg-adm-surface border border-adm-border text-xs"
                                    >
                                        <div>
                                            <div className="font-semibold text-adm-text">{item.bodyPart}</div>
                                            <div className="text-10 text-adm-muted mt-0.5">
                                                Type: <span className="text-adm-text font-medium">{item.painType}</span> • Severity: <span className="font-bold text-adm-accent">{item.severity}/10</span>
                                            </div>
                                            {item.notes && (
                                                <div className="text-9 text-adm-muted/80 italic mt-0.5">
                                                    &ldquo;{item.notes}&rdquo;
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePain(item.bodyPart)}
                                            className="p-1.5 text-adm-muted hover:text-adm-danger rounded-lg hover:bg-adm-danger/10 transition-colors cursor-pointer"
                                            title="Remove"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Medical Disclaimer Callout */}
            <div className="p-3 bg-adm-surface border border-adm-border rounded-xl flex items-start gap-2.5 text-xs text-adm-muted">
                <Info size={16} className="text-adm-accent shrink-0 mt-0.5" />
                <span>
                    <strong>Medical Safety Notice:</strong> This interactive pain map records self-reported discomfort for your clinical team to review. It does not provide medical diagnoses or prescribe treatments.
                </span>
            </div>
        </div>
    );
}
