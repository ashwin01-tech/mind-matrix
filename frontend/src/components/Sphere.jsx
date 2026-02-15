import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function SphereComponent({ isSpeaking }) {
    const sphereRef = useRef();
    const materialRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        
        if (sphereRef.current) {
            // Rotation animation
            sphereRef.current.rotation.x = time * 0.15;
            sphereRef.current.rotation.y = time * 0.2;
            
            // Dynamic scaling based on speaking state
            const targetScale = isSpeaking ? 2.1 : 2.0;
            sphereRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.1
            );
        }

        if (materialRef.current) {
            // Dynamic distortion - more pronounced when speaking
            const targetDistort = isSpeaking ? 0.6 : 0.3;
            const targetSpeed = isSpeaking ? 5 : 2;
            
            materialRef.current.distort += (targetDistort - materialRef.current.distort) * 0.1;
            materialRef.current.speed += (targetSpeed - materialRef.current.speed) * 0.05;
            
            // Pulsating effect when speaking
            if (isSpeaking) {
                const pulse = Math.sin(time * 3) * 0.05 + 0.95;
                materialRef.current.roughness = 0.2 * pulse;
            } else {
                materialRef.current.roughness = 0.2;
            }
        }
    });

    return (
        <Sphere ref={sphereRef} args={[1, 128, 128]} scale={2}>
            <MeshDistortMaterial
                ref={materialRef}
                color="#8aa2ea"
                attach="material"
                distort={0.3}
                speed={2}
                roughness={0.2}
                metalness={0.8}
                envMapIntensity={1.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />
        </Sphere>
    );
}

