'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  onRollComplete?: () => void;
}

function Dice({ value, isRolling, onRollComplete }: Dice3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const rollTimeRef = useRef(0);
  const animationCompletedRef = useRef(false);
  const displayedValueRef = useRef<number | null>(null);

  // Mapeo de valores a rotaciones que muestran ese número en la cara frontal
  const valueToRotation: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: Math.PI / 2, z: 0 },
    3: { x: -Math.PI / 2, y: 0, z: 0 },
    4: { x: Math.PI / 2, y: 0, z: 0 },
    5: { x: 0, y: -Math.PI / 2, z: 0 },
    6: { x: Math.PI, y: 0, z: 0 },
  };

  useEffect(() => {
    // Cuando el valor cambia y no estamos rodando, actualizar la rotación
    if (value !== null && !isRolling && meshRef.current) {
      displayedValueRef.current = value;
      const rotation = valueToRotation[value];
      if (rotation) {
        meshRef.current.rotation.x = rotation.x;
        meshRef.current.rotation.y = rotation.y;
        meshRef.current.rotation.z = rotation.z;
      }
    }
    
    // Reset cuando empieza a rodar
    if (isRolling) {
      displayedValueRef.current = null;
      animationCompletedRef.current = false;
      rollTimeRef.current = 0;
    }
  }, [value, isRolling]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    if (isRolling && !animationCompletedRef.current) {
      rollTimeRef.current += delta;

      // Rotación rápida y aleatoria durante el lanzamiento
      meshRef.current.rotation.x += delta * 15 + Math.sin(rollTimeRef.current * 5) * 2;
      meshRef.current.rotation.y += delta * 12 + Math.cos(rollTimeRef.current * 7) * 2;
      meshRef.current.rotation.z += delta * 8 + Math.sin(rollTimeRef.current * 3) * 1.5;

      // Después de 2 segundos, detener la animación
      if (rollTimeRef.current >= 2.0) {
        animationCompletedRef.current = true;
        
        // Cuando termine, si tenemos un valor, rotar hacia él
        if (value !== null) {
          const rotation = valueToRotation[value];
          if (rotation) {
            // Animación suave hacia la rotación final
            const targetX = rotation.x;
            const targetY = rotation.y;
            const targetZ = rotation.z;
            
            // Interpolar suavemente hacia la rotación objetivo
            const lerpFactor = 0.1;
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, lerpFactor);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, lerpFactor);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetZ, lerpFactor);
            
            displayedValueRef.current = value;
          }
        }

        if (onRollComplete) {
          setTimeout(() => {
            onRollComplete();
          }, 500);
        }
      }
    } else if (!isRolling && value !== null && displayedValueRef.current !== value) {
      // Asegurar que mostramos el valor correcto cuando no estamos rodando
      const rotation = valueToRotation[value];
      if (rotation && meshRef.current) {
        meshRef.current.rotation.x = rotation.x;
        meshRef.current.rotation.y = rotation.y;
        meshRef.current.rotation.z = rotation.z;
        displayedValueRef.current = value;
      }
    }
  });

  // Función para renderizar los puntos de un dado
  const renderDots = (faceValue: number) => {
    const positions: Record<number, Array<[number, number]>> = {
      1: [[0, 0]],
      2: [[-0.15, -0.15], [0.15, 0.15]],
      3: [[-0.15, -0.15], [0, 0], [0.15, 0.15]],
      4: [[-0.15, -0.15], [-0.15, 0.15], [0.15, -0.15], [0.15, 0.15]],
      5: [[-0.15, -0.15], [-0.15, 0.15], [0, 0], [0.15, -0.15], [0.15, 0.15]],
      6: [[-0.15, -0.2], [-0.15, 0], [-0.15, 0.2], [0.15, -0.2], [0.15, 0], [0.15, 0.2]],
    };

    const dotPositions = positions[faceValue] || [];
    // Los puntos deben estar dentro de la superficie del dado para parecer parte de la cara
    // Los grupos están posicionados en la superficie (z=0.5 para cara frontal)
    // Usamos z negativo para mover los puntos hacia adentro del cubo
    // -0.03 los coloca justo dentro de la superficie, haciéndolos parecer parte de la cara
    const dotZ = -0.03;
    
    return dotPositions.map((pos, idx) => (
      <mesh key={idx} position={[pos[0], pos[1], dotZ]}>
        {/* Esfera que parece estar integrada en la cara del dado */}
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    ));
  };

  // Determinar qué cara está mirando hacia la cámara
  const getVisibleFace = (): number | null => {
    if (!meshRef.current || isRolling || displayedValueRef.current === null) return null;
    return displayedValueRef.current;
  };

  const visibleFace = getVisibleFace();

  return (
    <group ref={meshRef}>
      {/* Cubo base del dado blanco */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Renderizar los puntos en la cara visible */}
      {visibleFace !== null && (
        <>
          {/* Cara 1 (frente - Z positivo) */}
          {visibleFace === 1 && (
            <group position={[0, 0, 0.5]} rotation={[0, 0, 0]}>
              {renderDots(1)}
            </group>
          )}
          {/* Cara 2 (abajo - Y negativo) */}
          {visibleFace === 2 && (
            <group position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {renderDots(2)}
            </group>
          )}
          {/* Cara 3 (derecha - X positivo) */}
          {visibleFace === 3 && (
            <group position={[0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              {renderDots(3)}
            </group>
          )}
          {/* Cara 4 (izquierda - X negativo) */}
          {visibleFace === 4 && (
            <group position={[-0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              {renderDots(4)}
            </group>
          )}
          {/* Cara 5 (arriba - Y positivo) */}
          {visibleFace === 5 && (
            <group position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              {renderDots(5)}
            </group>
          )}
          {/* Cara 6 (atrás - Z negativo) */}
          {visibleFace === 6 && (
            <group position={[0, 0, -0.5]} rotation={[Math.PI, 0, 0]}>
              {renderDots(6)}
            </group>
          )}
        </>
      )}
    </group>
  );
}

export function Dice3D({ value, isRolling, onRollComplete }: Dice3DProps) {
  return (
    <div className="w-32 h-32 relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-lg">
      <Canvas camera={{ position: [2.5, 2.5, 2.5], fov: 60 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />
        <pointLight position={[0, 0, 5]} intensity={0.5} />
        <Dice value={value} isRolling={isRolling} onRollComplete={onRollComplete} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
