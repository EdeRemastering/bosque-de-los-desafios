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
  const isRotatingToFinalRef = useRef(false);
  const finalRotationRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Mapeo de valores a rotaciones que muestran ese número en la cara frontal (Z+)
  // Ajustadas para que el número siempre se vea claramente desde la cámara
  // La cámara está en [2.5, 2.5, 2.5], así que la cara frontal (Z+) es la mejor orientada
  const valueToRotation: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 }, // Cara frontal (Z+) - 1 punto al centro
    2: { x: 0, y: -Math.PI / 2, z: 0 }, // Rotar para mostrar cara con 2 puntos (X-)
    3: { x: Math.PI / 2, y: 0, z: 0 }, // Rotar para mostrar cara superior (Y+)
    4: { x: -Math.PI / 2, y: 0, z: 0 }, // Rotar para mostrar cara inferior (Y-)
    5: { x: 0, y: Math.PI / 2, z: 0 }, // Rotar para mostrar cara con 5 puntos (X+)
    6: { x: 0, y: Math.PI, z: 0 }, // Rotar 180° para mostrar cara trasera (Z-)
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
      isRotatingToFinalRef.current = false;
      finalRotationRef.current = null;
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

      // Después de 2 segundos, comenzar a rotar hacia la posición final
      if (rollTimeRef.current >= 2.0) {
        animationCompletedRef.current = true;
        isRotatingToFinalRef.current = true;
        
        // Cuando termine, si tenemos un valor, establecer la rotación objetivo
        if (value !== null) {
          const rotation = valueToRotation[value];
          if (rotation) {
            finalRotationRef.current = rotation;
            displayedValueRef.current = value;
          }
        }

        if (onRollComplete) {
          setTimeout(() => {
            onRollComplete();
          }, 1500); // Aumentar el tiempo para que termine la animación de rotación
        }
      }
    } else if (isRotatingToFinalRef.current && finalRotationRef.current && meshRef.current) {
      // Animación suave hacia la rotación final usando easing
      const targetX = finalRotationRef.current.x;
      const targetY = finalRotationRef.current.y;
      const targetZ = finalRotationRef.current.z;
      
      // Normalizar ángulos para evitar rotaciones innecesarias (ej: rotar 270° en lugar de -90°)
      const normalizeAngle = (current: number, target: number): number => {
        let diff = target - current;
        // Normalizar a [-π, π]
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
      };
      
      const diffX = normalizeAngle(meshRef.current.rotation.x, targetX);
      const diffY = normalizeAngle(meshRef.current.rotation.y, targetY);
      const diffZ = normalizeAngle(meshRef.current.rotation.z, targetZ);
      
      // Usar un lerp factor más alto para una animación más rápida y suave
      const lerpFactor = Math.min(0.15, 1); // Más rápido para llegar a la posición final
      
      meshRef.current.rotation.x += diffX * lerpFactor;
      meshRef.current.rotation.y += diffY * lerpFactor;
      meshRef.current.rotation.z += diffZ * lerpFactor;
      
      // Verificar si estamos lo suficientemente cerca de la rotación objetivo
      const threshold = 0.01; // Umbral muy pequeño para precisión
      if (Math.abs(diffX) < threshold && 
          Math.abs(diffY) < threshold && 
          Math.abs(diffZ) < threshold) {
        // Establecer la rotación exacta
        meshRef.current.rotation.x = targetX;
        meshRef.current.rotation.y = targetY;
        meshRef.current.rotation.z = targetZ;
        isRotatingToFinalRef.current = false;
        finalRotationRef.current = null;
      }
    } else if (!isRolling && value !== null && displayedValueRef.current !== value) {
      // Asegurar que mostramos el valor correcto cuando no estamos rodando
      const rotation = valueToRotation[value];
      if (rotation && meshRef.current) {
        meshRef.current.rotation.x = rotation.x;
        meshRef.current.rotation.y = rotation.y;
        meshRef.current.rotation.z = rotation.z;
        displayedValueRef.current = value;
        isRotatingToFinalRef.current = false;
        finalRotationRef.current = null;
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

      {/* Renderizar los puntos en la cara frontal (Z+) después de la rotación */}
      {/* Después de rotar el dado, siempre renderizamos en la cara frontal (Z+) */}
      {visibleFace !== null && (
        <group position={[0, 0, 0.5]} rotation={[0, 0, 0]}>
          {renderDots(visibleFace)}
        </group>
      )}
    </group>
  );
}

export function Dice3D({ value, isRolling, onRollComplete }: Dice3DProps) {
  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-lg">
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
