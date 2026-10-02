import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const MODEL_URL = '/models/hand.glb';
const deg = THREE.MathUtils.degToRad;
const lerp = THREE.MathUtils.lerp;

/**
 * A pose in viewport units, as lenis.dev does: position is a fraction of the visible
 * width/height from the centre; scale is the hand's height as a fraction of the visible height.
 */
interface Pose {
  position: [number, number];
  scale: number;
  rotation: [number, number, number];
}

/** One pose per scroll stop, in page order (mirrors lenis.dev's arm keyframes). */
const DESKTOP_POSES: Pose[] = [
  { position: [-0.075, -0.42], scale: 1.0, rotation: [deg(5), deg(-20), 0] }, // top: rising behind the hero
  { position: [-0.04, -0.36], scale: 0.92, rotation: [deg(-8), deg(40), deg(-8)] }, // who we build for — start
  { position: [-0.02, -0.34], scale: 0.92, rotation: [deg(4), deg(160), deg(6)] }, // who we build for — end
  { position: [0.3, 0.06], scale: 0.5, rotation: [deg(20), deg(200), deg(30)] }, // capabilities — start
  { position: [-0.95, 0.08], scale: 0.75, rotation: [deg(-10), deg(320), deg(10)] }, // capabilities — end (drifts out left)
  { position: [0.18, -1.35], scale: 0.95, rotation: [0, deg(200), deg(-16)] }, // navy sections begin (below view)
  { position: [0, -0.48], scale: 0.85, rotation: [0, deg(-14), deg(-16)] }, // lifecycle cards
  { position: [0.22, -0.3], scale: 0.62, rotation: [0, deg(-700), deg(-16)] }, // end of page
];

/** Narrow screens: centred, smaller sweeps. */
const MOBILE_POSES: Pose[] = DESKTOP_POSES.map((pose, i) => ({
  ...pose,
  position: i === 0 ? [0, -0.3] : [pose.position[0] * 0.6, pose.position[1]],
  scale: i === 0 ? 0.78 : pose.scale * 0.75,
}));

/** Index of the stop where the navy wipe has just covered the screen. */
const DARK_STOP = 5;

/** Scroll positions (px) at which each pose is reached, measured from the page's sections. */
function measureStops(): number[] | null {
  const vh = window.innerHeight;
  const top = (id: string) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  };
  const about = top('about');
  const capabilities = top('capabilities');
  const approach = top('approach');
  const cards = top('approach-cards');
  if (about === null || capabilities === null || approach === null || cards === null) return null;
  const height = (id: string) => document.getElementById(id)?.offsetHeight ?? 0;

  return [
    0,
    about - vh / 2,
    about - vh / 2 + height('about'),
    capabilities - vh / 2,
    capabilities - vh / 2 + height('capabilities'),
    approach - vh,
    cards,
    document.documentElement.scrollHeight - vh,
  ];
}

/** Light sections: satin silver so navy text stays readable over it. Navy sections: mid-blue metal under sky text. */
const LOOKS = {
  light: { color: 0xdbe6f2, metalness: 0.55, roughness: 0.38, key: 0xffffff, ground: 0x8fa3c8 },
  dark: { color: 0x3a4bc0, metalness: 0.75, roughness: 0.4, key: 0xe6f4fd, ground: 0x0a1378 },
};

/**
 * Fixed WebGL layer behind the whole page. Like lenis.dev the hand never fades out: it moves
 * between per-section poses as you scroll, floats gently, and changes material with the theme.
 */
export function HandModel({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // No WebGL: the flat background is the fallback.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 7);
    const visibleH = 2 * camera.position.z * Math.tan(deg(camera.fov / 2));

    const ambient = new THREE.HemisphereLight(0xffffff, LOOKS.light.ground, 0.9);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(LOOKS.light.key, 1.6);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa0030e, 2.5); // the small Signal Red edge
    rim.position.set(4, -1, -3);
    scene.add(rim);

    const material = new THREE.MeshStandardMaterial();

    // rig = scroll pose; floater = idle drift (drei <Float> on lenis.dev); model normalised to 1 unit tall.
    const rig = new THREE.Group();
    const floater = new THREE.Group();
    rig.add(floater);
    scene.add(rig);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        model.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.computeVertexNormals();
            obj.material = material;
          }
        });
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));
        const normaliser = new THREE.Group();
        normaliser.add(model);
        normaliser.scale.setScalar(1 / size.y);
        floater.add(normaliser);
        renderer.domElement.style.opacity = '1';
      },
      undefined,
      () => {
        /* Missing model: keep the flat background. */
      },
    );

    let stops: number[] | null = null;
    let poses = DESKTOP_POSES;
    const layout = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      poses = w / h > 1 ? DESKTOP_POSES : MOBILE_POSES;
      stops = measureStops();
    };
    layout();
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(container);
    resizeObserver.observe(document.body); // section heights settle after fonts and layout

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let dark: boolean | null = null;
    const applyLook = (isDark: boolean) => {
      const look = isDark ? LOOKS.dark : LOOKS.light;
      material.color.setHex(look.color);
      material.metalness = look.metalness;
      material.roughness = look.roughness;
      key.color.setHex(look.key);
      ambient.groundColor.setHex(look.ground);
      document.documentElement.dataset.scene = isDark ? 'dark' : 'light';
    };

    const blended: Pose = { position: [0, 0], scale: 1, rotation: [0, 0, 0] };
    const poseAt = (scroll: number): Pose => {
      if (!stops) return poses[0];
      const last = stops.length - 1;
      let i = stops.findIndex((stop) => scroll < stop) - 1;
      if (i === -2) i = last; // beyond the final stop
      i = THREE.MathUtils.clamp(i, 0, last);
      const j = Math.min(i + 1, last);
      const span = stops[j] - stops[i];
      const t = span > 0 ? THREE.MathUtils.clamp((scroll - stops[i]) / span, 0, 1) : 0;
      const a = poses[i];
      const b = poses[j];
      blended.position[0] = lerp(a.position[0], b.position[0], t);
      blended.position[1] = lerp(a.position[1], b.position[1], t);
      blended.scale = lerp(a.scale, b.scale, t);
      for (let k = 0; k < 3; k++) blended.rotation[k] = lerp(a.rotation[k], b.rotation[k], t);
      return blended;
    };

    renderer.setAnimationLoop((time) => {
      if (!stops) stops = measureStops();
      const scroll = window.scrollY;

      const isDark = stops ? scroll >= stops[DARK_STOP] : false;
      if (isDark !== dark) {
        dark = isDark;
        applyLook(isDark);
      }

      const pose = poseAt(scroll);
      const visibleW = visibleH * camera.aspect;
      rig.position.set(pose.position[0] * visibleW, pose.position[1] * visibleH, 0);
      rig.scale.setScalar(pose.scale * visibleH);
      rig.rotation.set(
        pose.rotation[0] + (reducedMotion ? 0 : pointer.y * 0.08),
        pose.rotation[1] + (reducedMotion ? 0 : pointer.x * 0.15),
        pose.rotation[2],
      );

      if (!reducedMotion) {
        const t = time / 1000;
        floater.position.y = Math.sin(t * 0.9) * 0.015;
        floater.rotation.set(Math.cos(t * 0.5) * 0.04, Math.sin(t * 0.4) * 0.06, Math.sin(t * 0.3) * 0.03);
      }

      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete document.documentElement.dataset.scene;
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={`[&>canvas]:block [&>canvas]:size-full ${className}`} />;
}
