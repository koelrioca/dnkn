import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//hamburger menu
const icon = document.getElementById('icon');
const icon1 = document.getElementById("a")
const icon2 = document.getElementById("b")
const icon3 = document.getElementById("c")

function toggleMenu() {
  const nav = document.getElementById('nav');
  nav.classList.toggle('active');
  icon1.classList.toggle("a")
  icon2.classList.toggle("c")
  icon3.classList.toggle("b")
}

icon.addEventListener('click', toggleMenu);

//scroll parallax
function show() {
  gsap.registerPlugin(ScrollTrigger)
  const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
  })
  locoScroll.on("scroll", ScrollTrigger.update)
  ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    pinType: document.querySelector("#main").style.transform
      ? "transform"
      : "fixed",
  })
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update())
  ScrollTrigger.refresh()
}

show()

//canvas
const canvas = document.querySelector('canvas.webgl')

//Textures
const textureLoader = new THREE.TextureLoader()
const alphaShadow = textureLoader.load('/assets/texture/simpleShadow.jpg');

//Scene
const scene = new THREE.Scene()

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    transparent: true,
    color: 0x000000,
    opacity: 0.5,
    alphaMap: alphaShadow,
  })
)

sphereShadow.rotation.x = -Math.PI * 0.5

sphereShadow.position.y = -1
sphereShadow.position.x = 1.5

scene.add(sphereShadow)

//DDLoader
const bodyElement = document.querySelector("body")

const entranceAnimation = () => {
 const tl = gsap.timeline()

 tl.to(
   ".page-main",
   { opacity: 1 },
   {
     opacity: 0,
     display: "none",
     duration: 1.5,
     delay: 3.5,
   }
 )
   .to(".panels .panel:first-child, .panels .panel:last-child", {
     scaleY: 1,
     duration: 1,
   })
   .to(
     ".panels .panel:not(:first-child):not(:last-child)",
     { scaleY: 1 },
     "-=0.5"
   )
   .to(".panels .panel", {
     scaleY: 0,
     duration: 0.3,
     stagger: 0.05,
   })
   .to(".panels", {
     clipPath: "circle(0%)",
     skewX: 0,
     duration: 1,
   })
   .to(
     ".page-main",
     {
       clipPath: "circle(100%)",
       zIndex: 5000,
       duration: 1,
     },
     "-=0.3"
   )
   .to(".page-main", {
     clipPath: "circle(0%)",
     zIndex: 5000,
     skewX: 0,
     duration: 1,
   })

    bodyElement.classList.add("loaded")
}
entranceAnimation(); 

// Instantiate a loader
//GLTF Loader
const loader = new GLTFLoader();

let donut = null

loader.load(
  // resource URL
  "assets/donut/scene.gltf",
  // called when the resource is loaded
  (gltf) => {
    console.log(gltf)

    donut = gltf.scene

    const radius = 8.5

    donut.position.x = 1.5

    donut.rotation.x = Math.PI * 0.2
    donut.rotation.z = Math.PI * 0.15

    donut.scale.set(radius, radius, radius)

    scene.add(donut)
  }
)

//scroll donut
 gsap.to(".page_2", {
   rotationZ: 0.45,
   positionX: 1.5,
   scrollTrigger: {
     trigger: ".webgl",
     scroller: "#main",
     start: "top 5%",
     end: "top -90%",
     scrub: true,
     pin: true,
   },
 })

 //scroll donut media queries
let mm_1 = gsap.matchMedia()

mm_1.add("(max-width: 1024px)", () => {
  to(".page_2", {
    rotationZ: 0.45,
    positionX: 1.5,
    scrollTrigger: {
      trigger: ".webgl",
      scroller: "#main",
      start: "top 10%",
      end: "top -180%",
      scrub: true,
      pin: true,
    },
  })
})


let mm_2 = gsap.matchMedia()

mm_2.add("(max-width: 768px)", () => {
  to(".page_2", {
    rotationZ: 0.45,
    positionX: 1.5,
    scrollTrigger: {
      trigger: ".webgl",
      scroller: "#main",
      start: "top 20%",
      end: "top -360%",
      scrub: true,
      pin: true,
    },
  })
})

//Sizes
const sizes = {width: window.innerWidth, 
              height: window.innerHeight,}

//Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1,1000)
camera.position.z = 5

scene.add(camera)

//Light
const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(3, 5, 4)

directionalLight.castShadow = true
scene.add(directionalLight)

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Animate
const clock = new THREE.Clock()

let lastElapsedTime = 0

const swing = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  if (!!donut) {
    donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1
    sphereShadow.material.opacity = (1 - Math.abs(donut.position.y)) * 0.3
  }

  // Render
  renderer.render(scene, camera)

  window.requestAnimationFrame(swing)
}
swing()

//On Reload
window.onbeforeunload = function () {
  window.scrollTo(0, 0)
}
