import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

let scene;
let camera;
let renderer;
let controls;

function Init3DView() {
    scene =  new THREE.Scene();
    renderer =  new THREE.WebGLRenderer({ antialias: true });
    let obj = document.getElementById("3dcontainer");
    obj.appendChild(renderer.domElement);
    camera =  new THREE.PerspectiveCamera(60,obj.clientWidth / obj.clientHeight,0.1,1000);;
  renderer.setSize( obj.clientWidth - 20, obj.clientHeight - 20);
  window.addEventListener('resize', onWindowResize, false );

  controls = new OrbitControls(camera, renderer.domElement);


  scene.background = new THREE.Color(0xDCDCDC);

  InitBasicScene();

  camera.position.z = 5;

  AnimationLoop();
}

export function InitBasicScene()
{
    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.3);
    light.position.set( 0, 1, 0.3);
    scene.add(light);
    const light3 = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add( light3 )
}


function onWindowResize(){
    let obj = document.getElementById("3dcontainer") ;
    camera.aspect = renderer.domElement.innerWidth / renderer.domElement.innerWidth;
    camera.updateProjectionMatrix();

    renderer.setSize( obj.clientWidth - 20, obj.clientHeight - 20);

}

function AnimationLoop() {
  requestAnimationFrame(AnimationLoop);
  controls.update();
  renderer.render(scene, camera);
}

export { scene, Init3DView };