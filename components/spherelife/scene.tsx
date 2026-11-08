"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, MeshTransmissionMaterial, OrbitControls, QuadraticBezierLine, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { UniverseLink, UniverseSphere } from "./types";

/**
 * SphereLife™ — la scène. Un noyau de verre liquide dont la lumière suit le
 * LockIn Score, des planètes (une par domaine de vie) dont la taille et
 * l'éclat suivent la progression et l'énergie, des flux lumineux entre les
 * domaines liés, des particules en orbite. Tout le système tourne lentement ;
 * on fait pivoter, on zoome, on glisse une planète sur son orbite, on plonge
 * dans une sphère d'un clic.
 */

const INK = new THREE.Color("#04130e");
const RED = new THREE.Color("#10b981");
const WHITE = new THREE.Color("#d1fae5");
const SYSTEM_SPEED = 0.035;

export type SceneProps = {
  spheres: UniverseSphere[];
  links: UniverseLink[];
  coreScore: number;
  mode: "explore" | "move";
  reducedMotion: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onArrive: (id: number) => void;
  onMove: (id: number, angle: number) => void;
};

function orbitOf(index: number) {
  return {
    radius: 2.35 + index * 0.62,
    // Légère inclinaison alternée : l'univers a de la profondeur, pas un disque plat.
    tilt: (index % 2 === 0 ? 1 : -1) * (0.06 + (index % 3) * 0.05),
  };
}

function planetLocalPosition(index: number, angle: number): THREE.Vector3 {
  const { radius, tilt } = orbitOf(index);
  return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * tilt, Math.sin(angle) * radius);
}

/** Rebond léger en fin d'apparition (0 → 1 avec un dépassement de ~8 %). */
function easeOutBack(t: number) {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Échelle d'apparition d'un objet, avec un retard : 0 avant, 1 après son entrée. */
function appearScale(elapsed: number, delay: number, duration = 0.9) {
  const t = Math.max(0, Math.min(1, (elapsed - delay) / duration));
  return t === 0 ? 0.0001 : easeOutBack(t);
}

function planetSize(s: UniverseSphere) {
  return 0.16 + s.level * 0.045 + (s.progress / 100) * 0.1;
}

/** La couleur d'une sphère s'assombrit avec son énergie. */
function livingColor(hex: string, energy: number) {
  return new THREE.Color(hex).lerp(INK, 0.78 * (1 - energy / 100));
}

// ---------------------------------------------------------------------------
// Noyau
// ---------------------------------------------------------------------------

const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const fresnelFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(vNormal, vView)), 2.6);
    gl_FragColor = vec4(uColor * uIntensity, f * uIntensity);
  }
`;

function Halo({ radius, color, intensity }: { radius: number; color: THREE.Color; intensity: number }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: color.clone() },
      uIntensity: { value: intensity },
    }),
    [color, intensity],
  );
  return (
    <mesh scale={radius}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={fresnelVertex}
        fragmentShader={fresnelFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Core({ score, reducedMotion }: { score: number; reducedMotion: boolean }) {
  const lattice = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const heart = useRef<THREE.Mesh>(null);
  const root = useRef<THREE.Group>(null);
  // Le score fait la lumière : émeraude à bas régime, blanc menthe quand le membre est locked in.
  const energy = score / 100;
  const heartColor = useMemo(() => RED.clone().lerp(WHITE, Math.max(0, energy - 0.55) / 0.45), [energy]);
  const glow = 0.6 + energy * 2.4;

  useFrame((state, delta) => {
    // Le noyau s'allume en premier : 1,3 s, avec un léger rebond.
    root.current?.scale.setScalar(reducedMotion ? 1 : appearScale(state.clock.elapsedTime, 0.1, 1.3));
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (lattice.current) lattice.current.rotation.y += delta * 0.08;
    if (ringA.current) ringA.current.rotation.z += delta * 0.12;
    if (ringB.current) ringB.current.rotation.x -= delta * 0.09;
    if (heart.current) heart.current.scale.setScalar(0.48 + Math.sin(t * 1.6) * 0.025 * (0.5 + energy));
  });

  return (
    <group ref={root}>
      <mesh ref={heart} scale={0.48}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color={heartColor.clone().multiplyScalar(glow)} toneMapped={false} />
      </mesh>
      <pointLight color={heartColor} intensity={4 + energy * 26} distance={14} decay={1.6} />

      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={384}
          thickness={0.55}
          roughness={0.06}
          transmission={1}
          ior={1.25}
          chromaticAberration={0.07}
          anisotropy={0.2}
          distortion={0.35}
          distortionScale={0.4}
          temporalDistortion={reducedMotion ? 0 : 0.12}
          color="#ffe4e8"
          attenuationColor="#10b981"
          attenuationDistance={2.4}
        />
      </mesh>

      <mesh ref={lattice} scale={1.09}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color={RED} wireframe transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.32, 0.006, 8, 160]} />
        <meshBasicMaterial
          color={heartColor.clone().multiplyScalar(1.6)}
          toneMapped={false}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh ref={ringB} rotation={[0, Math.PI / 3, Math.PI / 5]}>
        <torusGeometry args={[1.48, 0.004, 8, 160]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} transparent opacity={0.35} />
      </mesh>

      <Halo radius={1.55} color={heartColor} intensity={0.35 + energy * 0.9} />
      <Sparkles count={40} scale={2.6} size={2.2} speed={reducedMotion ? 0 : 0.35} color={heartColor} opacity={0.8} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Particules en orbite
// ---------------------------------------------------------------------------

function OrbitDust({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color("#FFFFFF"), RED, WHITE, new THREE.Color("#6EE7B7")];
    // Générateur déterministe : même nuage à chaque rendu, pas d'aléatoire impur pendant le rendu.
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.pow(random(), 0.7) * 7.5;
      const theta = random() * Math.PI * 2;
      const y = (random() - 0.5) * 0.9 * (r / 4);
      positions.set([Math.cos(theta) * r, y, Math.sin(theta) * r], i * 3);
      const c = palette[Math.floor(random() * palette.length)];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (!reducedMotion && points.current) points.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        vertexColors
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Planètes
// ---------------------------------------------------------------------------

function OrbitRing({ index, color }: { index: number; color: string }) {
  const geometry = useMemo(() => {
    const pts = Array.from({ length: 129 }, (_, i) => planetLocalPosition(index, (i / 128) * Math.PI * 2));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [index]);
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.09} />
    </lineLoop>
  );
}

function Planet({
  sphere,
  index,
  position,
  mode,
  reducedMotion,
  onSelect,
  onDragStart,
}: {
  sphere: UniverseSphere;
  index: number;
  position: THREE.Vector3;
  mode: SceneProps["mode"];
  reducedMotion: boolean;
  onSelect: (id: number) => void;
  onDragStart: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const body = useRef<THREE.Mesh>(null);
  const appear = useRef<THREE.Group>(null);
  const size = planetSize(sphere);
  const color = useMemo(() => livingColor(sphere.color, sphere.energy), [sphere.color, sphere.energy]);
  const emissive = 0.08 + (sphere.energy / 100) * 0.55 + (sphere.progress / 100) * 0.3;

  useFrame((state, delta) => {
    // Apparition échelonnée : chaque planète naît 0,14 s après la précédente.
    appear.current?.scale.setScalar(reducedMotion ? 1 : appearScale(state.clock.elapsedTime, 0.7 + index * 0.14));
    if (!body.current) return;
    if (!reducedMotion) body.current.rotation.y += delta * 0.4;
    const target = hovered ? 1.25 : 1;
    body.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    // Une sphère qui s'éteint pulse faiblement : un signal discret, pas une alarme.
    if (!reducedMotion && sphere.energy < 35) {
      const material = body.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = emissive * (0.7 + Math.sin(state.clock.elapsedTime * 2.2) * 0.3);
    }
  });

  return (
    <group position={position}>
      <group ref={appear}>
        <mesh
          ref={body}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = mode === "move" ? "grab" : "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
          onPointerDown={(e) => {
            if (mode !== "move") return;
            e.stopPropagation();
            onDragStart(sphere.id);
          }}
          onClick={(e) => {
            if (mode !== "explore") return;
            e.stopPropagation();
            onSelect(sphere.id);
          }}
        >
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissive}
            roughness={0.35}
            metalness={0.2}
            toneMapped={false}
          />
        </mesh>
        <Halo radius={size * 1.6} color={color} intensity={0.2 + (sphere.energy / 100) * 0.55} />
        {sphere.level >= 4 ? (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <torusGeometry args={[size * 1.7, size * 0.035, 8, 96]} />
            <meshBasicMaterial color={color.clone().multiplyScalar(1.8)} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        ) : null}
        {sphere.contacts.slice(0, 6).map((contact, i, all) => (
          <Satellite key={contact.id} radius={size * 2.1} index={i} total={all.length} color={color} reducedMotion={reducedMotion} />
        ))}
        {sphere.progress >= 60 ? (
          <Sparkles count={14} scale={size * 4} size={1.6} speed={reducedMotion ? 0 : 0.5} color={sphere.color} />
        ) : null}
        <Html
          center
          position={[0, size + 0.32, 0]}
          distanceFactor={9}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md transition-all ${
              hovered
                ? "border-white/30 bg-[#08201a]/90 text-[#FFFFFF]"
                : "border-white/10 bg-[#04130e]/60 text-[#CFE3DA]"
            }`}
          >
            <span
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
              style={{ background: sphere.color }}
            />
            {sphere.name}
            <span className="ml-1.5 tabular-nums text-[#FFFFFF]">{sphere.score}</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

/** Un membre lié à la sphère : un point lumineux qui orbite la planète. */
function Satellite({
  radius,
  index,
  total,
  color,
  reducedMotion,
}: {
  radius: number;
  index: number;
  total: number;
  color: THREE.Color;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const phase = (index / total) * Math.PI * 2;
  useFrame((state) => {
    if (!ref.current) return;
    const a = phase + (reducedMotion ? 0 : state.clock.elapsedTime * 0.6);
    ref.current.position.set(Math.cos(a) * radius, Math.sin(a * 0.5) * radius * 0.3, Math.sin(a) * radius);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color={color.clone().multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      <Halo radius={0.22} color={color} intensity={0.6} />
    </group>
  );
}

/** Fil de lumière entre le noyau et une planète : plus la sphère vit, plus il brille. */
function Tether({ to, color, energy }: { to: THREE.Vector3; color: string; energy: number }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), to]);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.08 + (energy / 100) * 0.14,
    });
    return new THREE.Line(geometry, material);
  }, [to, color, energy]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
}

// ---------------------------------------------------------------------------
// Flux lumineux
// ---------------------------------------------------------------------------

function Flow({
  from,
  to,
  color,
  reducedMotion,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  reducedMotion: boolean;
}) {
  const pulse = useRef<THREE.Mesh>(null);
  const line = useRef<{ material: { dashOffset: number } } | null>(null);
  const mid = useMemo(
    () =>
      from
        .clone()
        .add(to)
        .multiplyScalar(0.35)
        .setY(Math.max(from.y, to.y) + 1.1),
    [from, to],
  );
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, mid, to]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (line.current) line.current.material.dashOffset -= delta * 0.6;
    if (pulse.current) pulse.current.position.copy(curve.getPoint((state.clock.elapsedTime * 0.25) % 1));
  });

  return (
    <group>
      <QuadraticBezierLine
        ref={line as never}
        start={from}
        end={to}
        mid={mid}
        color={color}
        lineWidth={1.4}
        dashed
        dashSize={0.25}
        gapSize={0.18}
        transparent
        opacity={0.75}
        toneMapped={false}
      />
      <mesh ref={pulse} position={from}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(3)} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Système : rotation, glisser-déposer, plongée cinématique
// ---------------------------------------------------------------------------

function System(props: SceneProps) {
  const { spheres, links, mode, reducedMotion, selectedId, onSelect, onArrive, onMove } = props;
  const system = useRef<THREE.Group>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const [angles, setAngles] = useState<Record<number, number>>({});
  const dragging = useRef<number | null>(null);
  const arrival = useRef<{ id: number; startedAt: number } | null>(null);
  const userTouched = useRef(false);

  const ordered = useMemo(() => [...spheres].sort((a, b) => a.position - b.position), [spheres]);
  const positions = useMemo(() => {
    const map = new Map<number, THREE.Vector3>();
    ordered.forEach((s, index) => map.set(s.id, planetLocalPosition(index, angles[s.id] ?? s.orbitAngle)));
    return map;
  }, [ordered, angles]);

  useEffect(() => {
    if (selectedId !== null) arrival.current = { id: selectedId, startedAt: performance.now() };
  }, [selectedId]);

  useFrame((state, delta) => {
    const group = system.current;
    if (!group) return;
    // Arrivée de la caméra : on glisse depuis plus loin et plus haut pendant 2,4 s,
    // sans jamais lutter contre le membre qui prend la main avant.
    if (!reducedMotion && selectedId === null && state.clock.elapsedTime < 2.4 && !userTouched.current) {
      const k = 1 - Math.pow(1 - Math.min(1, state.clock.elapsedTime / 2.4), 3);
      const from = new THREE.Vector3(0, 8, 20);
      const to = new THREE.Vector3(0, 3.8, 9.6);
      camera.position.lerpVectors(from, to, k);
      controls.current?.update();
    }
    if (!reducedMotion && mode === "explore" && selectedId === null) group.rotation.y += delta * SYSTEM_SPEED;

    // Plongée : la caméra rejoint la planète choisie, puis on entre dans la sphère.
    const travel = arrival.current;
    if (travel && controls.current) {
      const local = positions.get(travel.id);
      if (local) {
        const world = group.localToWorld(local.clone());
        const direction = world.clone().normalize();
        const destination = world
          .clone()
          .add(direction.multiplyScalar(1.4))
          .add(new THREE.Vector3(0, 0.35, 0));
        camera.position.lerp(destination, 1 - Math.pow(0.02, delta));
        controls.current.target.lerp(world, 1 - Math.pow(0.01, delta));
        controls.current.update();
        if (performance.now() - travel.startedAt > 1100) {
          arrival.current = null;
          onArrive(travel.id);
        }
      }
    }
  });

  function onPlaneMove(e: ThreeEvent<PointerEvent>) {
    const id = dragging.current;
    if (id === null || !system.current) return;
    const local = system.current.worldToLocal(e.point.clone());
    setAngles((prev) => ({ ...prev, [id]: Math.atan2(local.z, local.x) }));
  }

  function endDrag() {
    const id = dragging.current;
    if (id === null) return;
    dragging.current = null;
    if (controls.current) controls.current.enabled = true;
    document.body.style.cursor = "";
    const angle = angles[id];
    if (angle !== undefined) onMove(id, angle);
  }

  return (
    <>
      <OrbitControls
        ref={controls}
        onStart={() => {
          userTouched.current = true;
        }}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.2}
        maxDistance={24}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        maxPolarAngle={Math.PI * 0.82}
      />
      <group ref={system}>
        <Core score={props.coreScore} reducedMotion={reducedMotion} />

        {ordered.map((s, index) => (
          <OrbitRing key={`orbit-${s.id}`} index={index} color={s.color} />
        ))}

        {ordered.map((s) => (
          <Tether key={`tether-${s.id}`} to={positions.get(s.id)!} color={s.color} energy={s.energy} />
        ))}

        {links.map((link) => {
          const from = positions.get(link.from);
          const to = positions.get(link.to);
          const color = spheres.find((s) => s.id === link.from)?.color ?? "#10b981";
          if (!from || !to) return null;
          return <Flow key={link.id} from={from} to={to} color={color} reducedMotion={reducedMotion} />;
        })}

        {ordered.map((s, index) => (
          <Planet
            key={s.id}
            index={index}
            sphere={s}
            position={positions.get(s.id)!}
            mode={mode}
            reducedMotion={reducedMotion}
            onSelect={onSelect}
            onDragStart={(id) => {
              dragging.current = id;
              if (controls.current) controls.current.enabled = false;
              document.body.style.cursor = "grabbing";
            }}
          />
        ))}

        {mode === "move" ? (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={onPlaneMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ) : null}
      </group>

      <OrbitDust reducedMotion={reducedMotion} />
      <Stars radius={70} depth={40} count={1600} factor={2.6} saturation={0} fade speed={reducedMotion ? 0 : 0.4} />
    </>
  );
}

export default function SphereLifeScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.8, 9.6], fov: 40, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={0.6} color="#FFFFFF" />
      <System {...props} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.35} luminanceSmoothing={0.35} mipmapBlur radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
