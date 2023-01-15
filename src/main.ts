import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import fragmentShader from "./shaders/fragment.glsl?raw"
import vertexShader from "./shaders/vertex.glsl?raw"

/**
 * Base
 */

const scene = new THREE.Scene()
/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

window.addEventListener("resize", () => {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
/**

 * Camera
 */

const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.0001,
	100
)

camera.position.x = 0
camera.position.y = 0.4
camera.position.z = 0
scene.add(camera)

// Canvas

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer()
renderer.setClearColor("teal")
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.domElement.classList.add("webgl")
document.getElementById("app")?.prepend(renderer.domElement)

const parameters = {
	count: 10000,
	size: 0.005,
	radius: 0.5,
	branches: 6,
	spin: 1,
	randomness: 0.6,
	insideColor: "#60a2ff",
	outsideColor: "#fff4a4",
}

/**
 * Galaxy
 */
const pointsGeometry = new THREE.BufferGeometry()

const positions = new Float32Array(parameters.count * 3)
const colors = new Float32Array(parameters.count * 3)
const scales = new Float32Array(parameters.count * 1)

const insideColor = new THREE.Color(parameters.insideColor)
const outsideColor = new THREE.Color(parameters.outsideColor)

for (let i = 0; i < parameters.count; i++) {
	const i3 = i * 3

	const radius = Math.random() * parameters.radius

	const branchAngle = (i / parameters.branches) * Math.PI * 2

	const randomX = (Math.random() - 0.5) * parameters.randomness
	const randomY = (Math.random() - 0.5) * parameters.randomness
	const randomZ = (Math.random() - 0.5) * parameters.randomness

	positions[i3 + 0] = Math.cos(branchAngle) * radius + randomX
	positions[i3 + 1] = Math.random() * 0.1 + randomY //
	positions[i3 + 2] = Math.sin(branchAngle) * radius + randomZ

	const mixedColor = insideColor.clone()

	mixedColor.lerp(outsideColor, radius / parameters.radius)

	colors[i3 + 0] = mixedColor.r
	colors[i3 + 1] = mixedColor.g
	colors[i3 + 2] = mixedColor.b

	scales[i] = Math.random()
}

// console.log(colors)

pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
pointsGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1))

/**
 * Shader Material
 */

const pointsMaterial = new THREE.ShaderMaterial({
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	vertexColors: true,
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	uniforms: {
		uTime: { value: 0 },
		uSize: { value: 8 * renderer.getPixelRatio() },
	},
})

const points = new THREE.Points(pointsGeometry, pointsMaterial)
camera.lookAt(points.position)

scene.add(points)

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {
	const elapsedTime = clock.getElapsedTime()

	pointsMaterial.uniforms.uTime.value = (300 + elapsedTime) / 50

	renderer.render(scene, camera)

	window.requestAnimationFrame(tick)
}

tick()

gsap.registerPlugin(ScrollTrigger)

ScrollTrigger.defaults({
	immediateRender: false,
})

const galaxyTimeline = gsap.timeline({
	scrollTrigger: {
		trigger: "#app",
		start: "top top",
		endTrigger: "#app",
		end: "bottom bottom",
		scrub: 1,
	},
})

galaxyTimeline.to(points.rotation, { z: 1 })
