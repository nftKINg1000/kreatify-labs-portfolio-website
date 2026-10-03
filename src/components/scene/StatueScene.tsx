import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/*
  Decorative 3D Statue of Liberty (separate lazy chunk with three.js). The torch carries the
  Signal Red accent: the light that makes intelligence useful.. Renders on demand only —
  when scroll, pointer or size changes — so an idle page costs no GPU time.
*/

const MODEL_URL = '/models/liberty.glb';
const deg = THREE.MathUtils.degToRad;
const lerp = THREE.MathUtils.lerp;

interface Pose {
  /** Fraction of the visible width/height from the centre. */
  position: [number, number];
  /** Full model height as a fraction of the visible height. */
  scale: number;
  rotation: [number, number, number];
}

/** One pose per scroll stop, in page order. The statue turns slowly, like walking around a monument. */
const POSES: Pose[] = [
  { position: [0.27, -0.2], scale: 1.18, rotation: [0, deg(-28), 0] }, // hero: monumental, torch high
  { position: [0.3, -0.08], scale: 0.95, rotation: [0, deg(10), 0] }, // audience
  { position: [0.32, -0.02], scale: 0.66, rotation: [0, deg(60), 0] }, // capabilities
  { position: [0.75, 0.05], scale: 0.8, rotation: [0, deg(120), 0] }, // proof: drifting out right
  { position: [0.9, -1.3], scale: 0.9, rotation: [0, deg(160), 0] }, // approach/signature: parked off-screen
  { position: [0.3, -1.3], scale: 0.9, rotation: [0, deg(200), 0] }, // pricing: waiting below view
  { position: [0.37, -0.1], scale: 0.9, rotation: [0, deg(300), 0] }, // faq: rises again in navy
  { position: [0.43, -0.08], scale: 0.8, rotation: [0, deg(332), 0] }, // end of page
];
/** Material switches to the navy look here, while the statue is out of view. */
const DARK_STOP = 5;
const DEPTH = -4;
/** Fade the plinth into the page: below START (fraction of height) is discarded, fully opaque from END. */
const CUT = { start: 0.02, end: 0.16 };
/** The flame: the top of the model glows Signal Red. */
const TORCH = { start: 0.955, end: 0.985, color: 0xa0030e, intensity: 2.2 };

const LOOKS = {
  light: { color: 0xdbe6f2, metalness: 0.55, roughness: 0.38, key: 0xffffff, ground: 0x8fa3c8, fog: 0xe6f4fd, rim: 2.5 },
  dark: { color: 0x3a4bc0, metalness: 0.75, roughness: 0.4, key: 0xe6f4fd, ground: 0x0a1378, fog: 0x0a1378, rim: 0.8 },
};

function measureStops(): number[] | null {
  const vh = window.innerHeight;
  const top = (id: string) => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  };
  const audience = top('audience');
  const capabilities = top('capabilities');
  const proof = top('proof');
  const signature = top('signature');
  const pricing = top('pricing');
  const faq = top('faq');
  if ([audience, capabilities, proof, signature, pricing, faq].some((v) => v === null)) return null;
  return [
    0,
    audience! - vh / 2,
    capabilities! - vh / 2,
    proof! - vh / 2,
    signature! - vh,
    pricing! - vh,
    faq! - vh / 2,
    document.documentElement.scrollHeight - vh,
  ];
}

interface StatueSceneProps {
  onReady: () => void;
  onFailure: () => void;
}

export default function StatueScene({ onReady, onFailure }: StatueSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onFailure });
  useEffect(() => {
    callbacks.current = { onReady, onFailure };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      callbacks.current.onFailure();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.classList.add('scene-canvas');
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 7);
    const visibleH = 2 * (camera.position.z - DEPTH) * Math.tan(deg(camera.fov / 2));
    scene.fog = new THREE.Fog(LOOKS.light.fog, 8, 24);

    const ambient = new THREE.HemisphereLight(0xffffff, LOOKS.light.ground, 0.9);
    const key = new THREE.DirectionalLight(LOOKS.light.key, 1.6);
    key.position.set(-3, 4, 5);
    const rim = new THREE.DirectionalLight(0xa0030e, 2.5); // the small Signal Red edge
    rim.position.set(4, -1, -3);
    scene.add(ambient, key, rim);

    const cutUniforms = {
      uCutStart: { value: 0 },
      uCutEnd: { value: 0 },
      uGlowStart: { value: 0 },
      uGlowEnd: { value: 0 },
      uGlowColor: { value: new THREE.Color(TORCH.color).multiplyScalar(TORCH.intensity) },
    };
    const material = new THREE.MeshStandardMaterial({ transparent: true });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, cutUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vLocalY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocalY = position.y;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying float vLocalY;\nuniform float uCutStart;\nuniform float uCutEnd;\nuniform float uGlowStart;\nuniform float uGlowEnd;\nuniform vec3 uGlowColor;',
        )
        .replace(
          '#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlowColor * smoothstep(uGlowStart, uGlowEnd, vLocalY);',
        )
        .replace(
          '#include <dithering_fragment>',
          '#include <dithering_fragment>\nif (vLocalY < uCutStart) discard;\ngl_FragColor.a *= smoothstep(uCutStart, uCutEnd, vLocalY);',
        );
    };

    const rig = new THREE.Group();
    scene.add(rig);

    let disposed = false;
    let loaded = false;
    let raf = 0;
    let stops: number[] | null = null;
    let dark: boolean | null = null;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const applyLook = (isDark: boolean) => {
      const look = isDark ? LOOKS.dark : LOOKS.light;
      material.color.setHex(look.color);
      material.metalness = look.metalness;
      material.roughness = look.roughness;
      key.color.setHex(look.key);
      rim.intensity = look.rim;
      ambient.groundColor.setHex(look.ground);
      (scene.fog as THREE.Fog).color.setHex(look.fog);
      document.documentElement.dataset.scene = isDark ? 'dark' : 'light';
    };

    const poseAt = (scroll: number): Pose => {
      if (!stops) return POSES[0];
      const last = stops.length - 1;
      let i = stops.findIndex((stop) => scroll < stop) - 1;
      if (i === -2) i = last;
      i = THREE.MathUtils.clamp(i, 0, last);
      const j = Math.min(i + 1, last);
      const span = stops[j] - stops[i];
      const t = span > 0 ? THREE.MathUtils.clamp((scroll - stops[i]) / span, 0, 1) : 0;
      const a = POSES[i];
      const b = POSES[j];
      return {
        position: [lerp(a.position[0], b.position[0], t), lerp(a.position[1], b.position[1], t)],
        scale: lerp(a.scale, b.scale, t),
        rotation: [lerp(a.rotation[0], b.rotation[0], t), lerp(a.rotation[1], b.rotation[1], t), lerp(a.rotation[2], b.rotation[2], t)],
      };
    };

    const frame = () => {
      raf = 0;
      if (disposed || !loaded || document.visibilityState === 'hidden') return;
      if (!stops) stops = measureStops();
      const scroll = window.scrollY;

      const isDark = stops ? scroll >= stops[DARK_STOP] : false;
      if (isDark !== dark) {
        dark = isDark;
        applyLook(isDark);
      }

      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;

      const pose = poseAt(scroll);
      const visibleW = visibleH * camera.aspect;
      rig.position.set(pose.position[0] * visibleW, pose.position[1] * visibleH, DEPTH);
      rig.scale.setScalar(pose.scale * visibleH);
      rig.rotation.set(pose.rotation[0] + pointer.y * 0.08, pose.rotation[1] + pointer.x * 0.15, pose.rotation[2]);
      renderer.render(scene, camera);

      // Keep easing toward the pointer, then stop: an idle page renders nothing.
      if (Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001) request();
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const layout = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      stops = measureStops();
      request();
    };
    layout();

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(container);
    resizeObserver.observe(document.body);
    const onScroll = () => request();
    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      request();
    };
    const onVisibility = () => document.visibilityState === 'visible' && request();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      callbacks.current.onFailure();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);

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
            obj.geometry.computeBoundingBox();
            const box = obj.geometry.boundingBox;
            if (box) {
              const span = box.max.y - box.min.y;
              cutUniforms.uCutStart.value = box.min.y + span * CUT.start;
              cutUniforms.uCutEnd.value = box.min.y + span * CUT.end;
              cutUniforms.uGlowStart.value = box.min.y + span * TORCH.start;
              cutUniforms.uGlowEnd.value = box.min.y + span * TORCH.end;
            }
            obj.material = material;
          }
        });
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        model.position.sub(bounds.getCenter(new THREE.Vector3()));
        const normaliser = new THREE.Group();
        normaliser.add(model);
        normaliser.scale.setScalar(1 / size.y);
        rig.add(normaliser);
        loaded = true;
        canvas.classList.add('is-ready');
        callbacks.current.onReady();
        request();
      },
      undefined,
      () => callbacks.current.onFailure(),
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      material.dispose();
      renderer.dispose();
      canvas.remove();
      delete document.documentElement.dataset.scene;
    };
  }, []);

  return <div ref={containerRef} className="scene-host" />;
}
