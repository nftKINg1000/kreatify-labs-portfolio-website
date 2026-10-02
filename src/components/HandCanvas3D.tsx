import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PINK = 0xff98a2;
const WHITE = 0xefefef;

const FINGERS = [
  { name: 'thumb', x: -1.5, y: -0.4, z: 0.2, scale: 0.85, rotZ: 0.6, rotY: 0.4 },
  { name: 'index', x: -0.9, y: 1.45, z: 0, scale: 1.0, rotZ: 0.05, rotY: 0 },
  { name: 'middle', x: -0.3, y: 1.55, z: 0, scale: 1.08, rotZ: 0, rotY: 0 },
  { name: 'ring', x: 0.3, y: 1.45, z: 0, scale: 0.98, rotZ: -0.05, rotY: 0 },
  { name: 'pinky', x: 0.85, y: 1.15, z: 0, scale: 0.8, rotZ: -0.12, rotY: 0 },
];

function buildHand(body: THREE.Material, joint: THREE.Material, glow: THREE.Material) {
  const hand = new THREE.Group();

  const palm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.9, 0.75, 4, 4, 4), body);
  hand.add(palm);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 32), joint);
  core.position.set(0, 0.2, 0.4);
  hand.add(core);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 16, 60), glow);
  ring.position.set(0, 0.2, 0.4);
  hand.add(ring);

  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 1.6, 24), body);
  wrist.position.set(0, -2.15, 0);
  hand.add(wrist);

  const pistonGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 12);
  for (const x of [-0.65, 0.65]) {
    const piston = new THREE.Mesh(pistonGeo, joint);
    piston.position.set(x, -2.15, 0.4);
    hand.add(piston);
  }

  // Each finger is three nested joints so bending the base carries the rest.
  const segments = [
    { knuckle: 0.33, radiusTop: 0.24, radiusBottom: 0.27, length: 0.95 },
    { knuckle: 0.27, radiusTop: 0.21, radiusBottom: 0.24, length: 0.75 },
    { knuckle: 0.21, radiusTop: 0, radiusBottom: 0.19, length: 0.65 },
  ];

  const fingers: THREE.Group[][] = FINGERS.map((spec) => {
    const joints: THREE.Group[] = [];
    let parent: THREE.Object3D = hand;

    segments.forEach((seg, i) => {
      const jointGroup = new THREE.Group();
      if (i === 0) {
        jointGroup.position.set(spec.x, spec.y, spec.z);
        jointGroup.rotation.set(0, spec.rotY, spec.rotZ);
      } else {
        jointGroup.position.y = segments[i - 1].length * spec.scale;
      }
      parent.add(jointGroup);

      jointGroup.add(new THREE.Mesh(new THREE.SphereGeometry(seg.knuckle * spec.scale, 16, 16), joint));

      const boneGeo = new THREE.CylinderGeometry(
        seg.radiusTop * spec.scale,
        seg.radiusBottom * spec.scale,
        seg.length * spec.scale,
        16,
      );
      boneGeo.translate(0, (seg.length * spec.scale) / 2, 0);
      jointGroup.add(new THREE.Mesh(boneGeo, body));

      joints.push(jointGroup);
      parent = jointGroup;
    });

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.13 * spec.scale, 16, 16), glow);
    tip.position.y = segments[2].length * spec.scale;
    parent.add(tip);

    return joints;
  });

  return { hand, core, ring, fingers };
}

/** Procedural WebGL hand that sits behind the page and turns as you scroll. */
export function HandCanvas3D({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.SpotLight(PINK, 18);
    key.position.set(10, 15, 10);
    key.angle = Math.PI / 4;
    key.penumbra = 0.8;
    scene.add(key);
    const rim = new THREE.DirectionalLight(WHITE, 2.5);
    rim.position.set(-8, 4, -6);
    scene.add(rim);
    const fill = new THREE.PointLight(PINK, 6, 30);
    fill.position.set(-10, -5, 8);
    scene.add(fill);

    const body = new THREE.MeshPhysicalMaterial({
      color: 0x0c0c0e,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const joint = new THREE.MeshBasicMaterial({ color: PINK });
    const glow = new THREE.MeshBasicMaterial({ color: WHITE });

    const { hand, core, ring, fingers } = buildHand(body, joint, glow);
    scene.add(hand);

    const particleCount = 320;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < positions.length; i += 3) {
      const radius = 3.6 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ size: 0.05, color: PINK, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
    );
    hand.add(particles);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      // Sit to the right on wide screens, centred and smaller on narrow ones.
      const wide = w / h > 1;
      hand.position.x = wide ? 3.2 : 0;
      hand.scale.setScalar(wide ? 1 : 0.7);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    renderer.setAnimationLoop((timestamp) => {
      const t = reducedMotion ? 0 : timestamp / 1000;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const scroll = max > 0 ? window.scrollY / max : 0;
      // Full presence in the hero, then recede so it never fights body copy.
      const heroFade = 1 - Math.min(1, window.scrollY / window.innerHeight);
      renderer.domElement.style.opacity = (0.3 + heroFade * 0.7).toFixed(3);

      const targetY = scroll * Math.PI * 4 + pointer.x * 0.4;
      const targetX = scroll * Math.PI * 0.5 + pointer.y * 0.3;
      hand.rotation.y += (targetY - hand.rotation.y) * 0.05;
      hand.rotation.x += (targetX - hand.rotation.x) * 0.05;
      hand.position.y = Math.sin(t * 1.5) * 0.25;

      core.scale.setScalar(1 + Math.sin(t * 5) * 0.12);
      ring.rotation.z = t * 0.9;
      ring.rotation.x = t * 0.6;
      particles.rotation.y = t * 0.12;

      fingers.forEach(([base, middle], i) => {
        const flex = Math.sin(Math.sin(t * 2) + i * 0.5) * 0.15 + 0.15;
        base.rotation.x = THREE.MathUtils.lerp(base.rotation.x, flex, 0.05);
        middle.rotation.x = THREE.MathUtils.lerp(middle.rotation.x, flex * 0.8, 0.05);
      });

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={`[&>canvas]:block [&>canvas]:size-full ${className}`} />;
}
