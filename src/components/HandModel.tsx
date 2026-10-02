import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const MODEL_URL = '/models/hand.glb';
const NAVY = 0x0a1378;
const SIGNAL = 0xa0030e;

/**
 * Sculpted hand rendered in matte Deep Navy with a thin Signal Red rim
 * (brand guide p.21: navy matte surfaces, a small red edge, a pale environment).
 * Lives behind the hero, turns with scroll, and stops rendering once scrolled away.
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
      return; // No WebGL: the flat Open Sky field is the fallback.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.opacity = '0';
    renderer.domElement.style.transition = 'opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 7);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa3c8, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(SIGNAL, 6);
    rim.position.set(4, 1, -4);
    scene.add(rim);

    const rig = new THREE.Group();
    scene.add(rig);

    const material = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.8, metalness: 0.05 });

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
        // Normalise: centre the model and make it 3 units tall.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        model.position.sub(centre);
        const wrapper = new THREE.Group();
        wrapper.add(model);
        wrapper.scale.setScalar(3 / size.y);
        rig.add(wrapper);
        renderer.domElement.style.opacity = '1';
      },
      undefined,
      () => {
        /* Missing model: keep the flat field. */
      },
    );

    const layout = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      // Rise into the empty lower-left of the hero, below the wordmark and clear of the headline,
      // so the scene never sits behind text (brand guide p.21).
      const wide = w / h > 1;
      const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const visibleW = visibleH * camera.aspect;
      const scale = wide ? 1 : 0.5;
      const fingertipsFromTop = wide ? 0.47 : 0.33; // fraction of the viewport height
      rig.scale.setScalar(scale);
      rig.position.set(wide ? -visibleW * 0.075 : 0, visibleH * (0.5 - fingertipsFromTop) - 1.5 * scale, 0);
    };
    layout();
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(container);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let visible = true;
    renderer.setAnimationLoop((time) => {
      const heroProgress = Math.min(1, window.scrollY / window.innerHeight);
      const nowVisible = heroProgress < 1;
      if (!nowVisible && !visible) return; // Paused while the hero is out of view.
      visible = nowVisible;

      const t = reducedMotion ? 0 : time / 1000;
      const targetY = -0.35 + heroProgress * Math.PI * 0.6 + (reducedMotion ? 0 : pointer.x * 0.25);
      const targetX = 0.08 + (reducedMotion ? 0 : pointer.y * 0.12);
      rig.rotation.y += (targetY - rig.rotation.y) * 0.06;
      rig.rotation.x += (targetX - rig.rotation.x) * 0.06;
      rig.rotation.z = Math.sin(t * 0.6) * 0.03;
      container.style.opacity = String(1 - heroProgress);
      container.style.translate = `0 ${heroProgress * -12}vh`;

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
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className={`[&>canvas]:block [&>canvas]:size-full ${className}`} />;
}
