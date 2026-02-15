import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function SphereComponent({ isSpeaking }) {
    const sphereRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (sphereRef.current) {
            sphereRef.current.distort = isSpeaking ? 0.6 : 0.3;
            sphereRef.current.speed = isSpeaking ? 5 : 2;
            sphereRef.current.rotation.x = time * 0.2;
            sphereRef.current.rotation.y = time * 0.3;
        }
    });

    return (
        <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2}>
            <MeshDistortMaterial
                color="#8aa2ea"
                attach="material"
                distort={0.3}
                speed={2}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}
