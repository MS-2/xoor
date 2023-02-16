import React, {
	useRef,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const Render3D = () => {
	const containerRef = useRef(null);
	const [color, setColor] = useState("white");
	const [scale, setScale] = useState(2);
	const light = useMemo(() => new THREE.PointLight(0xffffff, 1, 100), []);
	let mouseX = 0;
	let mouseY = 0;
	let animationId;

	useEffect(() => {
		const loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		const scene = new THREE.Scene();
		const renderer = new THREE.WebGLRenderer();
		const handleMouseMove = (event: { clientX: number; clientY: number }) => {
			mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
		};
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		camera.position.z = 5;
		light.position.set(0, 0, 10);
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef?.current?.appendChild(renderer.domElement);
		dracoLoader.setDecoderConfig({ type: "js" });
		dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
		dracoLoader.preload();
		loader.setDRACOLoader(dracoLoader);
		loader.load("/model.glb", (gltf) => {
			window.addEventListener("mousemove", handleMouseMove);
			const model = gltf.scene;
			model.scale.set(scale, scale, scale);
			model.traverse((node) => {
				if (node.isMesh) {
					node.material.color.set(color);
				}
			});
			scene.add(model);
			scene.add(light);
			renderer.render(scene, camera);
			const animate = () => {
				model.rotation.x = mouseY * 0.5;
				model.rotation.y = mouseX * 0.5;
				renderer.render(scene, camera);
				animationId = requestAnimationFrame(animate);
			};
			animate();
		});
		return function cleanup() {
			containerRef?.current?.removeChild(renderer.domElement);
		};
	}, [containerRef, color, scale]);

	const handleColorChange = useCallback(
		(color: string) => {
			setColor(color);
		},
		[color],
	);

	const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setScale(+e.target.value);
	};

	return (
		<div ref={containerRef}>
			<button onClick={() => handleColorChange("red")}>red</button>
			<button onClick={() => handleColorChange("green")}>Green</button>
			<button onClick={() => handleColorChange("yellow")}>yellow</button>
			<button onClick={() => handleColorChange("white")}>un cambio </button>
			<p>set any number to change size</p>
			<input type="number" onChange={(e) => handleScaleChange(e)} />
		</div>
	);
};

export default Render3D;
