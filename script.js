// Scene setup

const scene = new THREE.Scene();
const worldGroup = new THREE.Group();
scene.add(worldGroup);
scene.background = new THREE.Color(0x001219);


const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("mobius"),
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
scene.fog = new THREE.Fog(0x001219, 6, 20);
renderer.setClearColor(0x000000, 1);

// Torus Knot
/*const geometry = new THREE.TorusKnotGeometry(2, 0.4, 300, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ffff,
  wireframe: true
});
const knot = new THREE.Mesh(geometry, material);
worldGroup.add(knot);*/

const geometry = new THREE.TorusKnotGeometry(2, 0.4, 200, 32);
geometry.computeBoundingBox();

const bbox = geometry.boundingBox;
const size = new THREE.Vector3();
bbox.getSize(size);

const positions = geometry.attributes.position;
const colors = [];

// Full palette
const palette = [
  new THREE.Color(0x001219),
  new THREE.Color(0x005f73),
  new THREE.Color(0x0a9396),
  new THREE.Color(0x94d2bd),
  new THREE.Color(0xe9d8a6),
  new THREE.Color(0xee9b00),
  new THREE.Color(0xca6702),
  new THREE.Color(0xbb3e03),
  new THREE.Color(0xae2012),
  new THREE.Color(0x9b2226)
];

for (let i = 0; i < positions.count; i++) {
  const y = positions.getY(i);
  const t = (y - bbox.min.y) / size.y; // normalize 0 → 1

  // map t across palette stops
  const scaled = t * (palette.length - 1);
  const index = Math.floor(scaled);
  const lerpFactor = scaled - index;

  const colorA = palette[index];
  const colorB = palette[Math.min(index + 1, palette.length - 1)];

  const finalColor = new THREE.Color().lerpColors(colorA, colorB, lerpFactor);

  colors.push(finalColor.r, finalColor.g, finalColor.b);
}

geometry.setAttribute(
  "color",
  new THREE.Float32BufferAttribute(colors, 3)
);

const material = new THREE.MeshStandardMaterial({
  vertexColors: true,
  metalness: 0.4,
  roughness: 0.7,
  wireframe: true
});

const knot = new THREE.Mesh(geometry, material);
worldGroup.add(knot);



// Lights
const keyLight = new THREE.PointLight(0xffffff, 1.2);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xffffff, 0.8);
rimLight.position.set(-5, -3, -5);
scene.add(rimLight);

// Knot curve
class KnotCurve extends THREE.Curve {
  getPoint(t) {
    const p = 2, q = 3;
    const theta = 2 * Math.PI * t;
    const r = 2, scale = 0.5;
    const x = (r + scale * Math.cos(q * theta)) * Math.cos(p * theta);
    const y = (r + scale * Math.cos(q * theta)) * Math.sin(p * theta);
    const z = scale * Math.sin(q * theta);
    return new THREE.Vector3(x, y, z);
  }
}
const curve = new KnotCurve();

// Scroll
let scrollPercent = 0;
let smoothScroll = 0;
function updateScroll() {
  const scrollTop = window.scrollY || window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = scrollTop / docHeight;
}
window.addEventListener("scroll", updateScroll);
updateScroll();

// Sections data
const sectionsData = [
  { label: "ABOUT", t: 0.3 },
  { label: "CV", t: 0.52 },
  { label: "PROJECTS", t: 0.7 },
  { label: "TEACHING", t: 0.85 },
  { label: "CONTACT", t: 0.94 }
];

// Create section meshes fixed to knot vertices
const sections = [];
sectionsData.forEach(sec => {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e9d8a6"; // Wheat
  ctx.font = "bold 200px 'JetBrains Mono', monospace"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sec.label, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0 // start invisible
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), material);

  // Store the t position
  plane.userData.tPosition = sec.t;
  sections.push(plane);
  worldGroup.add(plane);
});

// Camera-facing helper
function faceCamera(mesh) {
  mesh.lookAt(camera.position);
}

// Convert world position to screen (if needed)
function toScreenPosition(pos, camera) {
  const vector = pos.clone().project(camera);
  return {
    x: (vector.x * 0.5 + 0.5) * window.innerWidth,
    y: (-vector.y * 0.5 + 0.5) * window.innerHeight
  };
}


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Map each mesh to its URL
const sectionLinks = {
  "ABOUT": "about/",
  "CV": "cv/",
  "PROJECTS": "projects/",
  "TEACHING": "teaching/",
  "CONTACT": "contact/"
};



window.addEventListener("click", (event) => {
  // Convert mouse to normalized device coordinates (-1 to 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersections
  const intersects = raycaster.intersectObjects(sections);
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    const label = sectionsData.find(s => s.t === clickedMesh.userData.tPosition).label;
    const url = sectionLinks[label];
    if (url) {
      window.location.href = sectionLinks[label]; // navigate to page
    }
  }
});




let nameMesh;

const loader = new THREE.FontLoader();
loader.load(
  "/assets/fonts/JetBrains.json",
  function (font){

    const geometry = new THREE.TextGeometry("KIAN SHAH", {
      font: font,
      size: 1.5,
      height: 0.05,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 8
    });

    geometry.center();

    const material = new THREE.MeshStandardMaterial({
  color: 0x94D2BD, // blue
  metalness: 0.2,
  roughness: 0.6,
  emissive: 0x94D2BD,
  emissiveIntensity: 0.5
});





    nameMesh = new THREE.Mesh(geometry, material);
    scene.add(nameMesh);
  }
);


// Animate
function animate() {
  requestAnimationFrame(animate);

  smoothScroll += (scrollPercent - smoothScroll) * 0.05;
  const t = smoothScroll;

  // Camera along curve after intro
  const introEnd = 0.1;
  const blend = Math.min(smoothScroll / introEnd, 1);
  const introPos = new THREE.Vector3(0, 0, 5);
  const introLook = new THREE.Vector3(0, 0, 0);
  const curvePos = curve.getPointAt(t);
  const curveLook = curve.getPointAt((t + 0.01) % 1);

  const camPos = introPos.clone().lerp(curvePos, Math.max(blend, 0));
  const camLook = introLook.clone().lerp(curveLook, Math.max(blend, 0));
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // Knot gentle rotation during intro
  if (blend < 1) {
  worldGroup.rotation.y += 0.002 * (1 - blend);
  worldGroup.rotation.x += 0.0005 * (1 - blend); // adjust speed for x if needed
} else {
  worldGroup.rotation.y *= 0.9;
  worldGroup.rotation.x *= 0.9;
}


  // Update sections
  sections.forEach(mesh => {
    // Fixed position on knot
    const pos = curve.getPointAt(mesh.userData.tPosition);
    mesh.position.copy(pos);

    // Face camera
    faceCamera(mesh);

    // Fade based on distance to scroll t
    if (blend < 1) {
      mesh.material.opacity = 0; // hide during intro
    } else {
      const distance = Math.abs(mesh.userData.tPosition - t);
      // Only show the closest section
      const fade = Math.max(0, 1 - distance * 8); 
      mesh.material.opacity = fade;
    }
  });
  if (nameMesh) {
  nameMesh.material.opacity = 1 - 2*blend;
  nameMesh.material.transparent = true;
  }
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(sections);
  sections.forEach(mesh => {
    if (intersects.find(i => i.object === mesh)) {
      mesh.scale.set(1.1, 1.1, 1.1); // slightly bigger
    } else {
      mesh.scale.set(1, 1, 1);
    }
  });


  renderer.render(scene, camera);
}

animate();
