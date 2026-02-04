'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function GoldenApple(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh {...props} ref={meshRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color="#FFD700"
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#FFD700"
                    emissiveIntensity={0.2}
                />
            </mesh>
        </Float>
    );
}

function GreekShield(props: any) {
    const meshRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y -= delta * 0.2;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
            <group ref={meshRef} {...props}>
                {/* Main shield body */}
                <mesh>
                    <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
                    <meshStandardMaterial color="#B8860B" roughness={0.3} metalness={0.9} />
                </mesh>
                {/* Boss (center bump) */}
                <mesh position={[0, 0.1, 0]}>
                    <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshStandardMaterial color="#DAA520" roughness={0.2} metalness={1} />
                </mesh>
                {/* Rim */}
                <mesh>
                    <torusGeometry args={[1.5, 0.05, 16, 100]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.8} />
                </mesh>
            </group>
        </Float>
    )
}

export function ArtifactViewer({ type = 'apple' }: { type?: 'apple' | 'shield' }) {
    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-gold/20 relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-gold font-serif text-lg bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-gold/10">
                    {type === 'apple' ? 'Golden Apple of Discord' : 'Shield of Achilles'}
                </h3>
            </div>

            <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
                <Environment preset="sunset" />
                <Stage environment="sunset" intensity={0.5}>
                    {type === 'apple' ? <GoldenApple /> : <GreekShield rotation={[Math.PI / 2, 0, 0]} />}
                </Stage>
            </Canvas>
        </div>
    );
}
