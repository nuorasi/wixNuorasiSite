console.log("Hello FROM newParticle.js!!!!!!!!!!!!!! REV 3.52 VERSION: 09-30-26 06:22");

console.log(
    "Canvas:",
    document.getElementById('particleCanvas')
);
// VERSION: 2026-09-26-12:48
console.log(">>>>>>>>>>>>>>>>>>>>THREE.js: THREE THREE THREE THREE THREE THREEX");

// 1. Setup Three.js Scene, Camera, and Renderer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('particleCanvas'),
    alpha: true
});
//
// renderer.setSize(
//     window.innerWidth,
//     window.innerHeightfm
// );

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);


// Handle window resizing OLD
// window.addEventListener('resize', () => {
//
//     renderer.setSize(
//         window.innerWidth,
//         window.innerHeight
//     );
//
//     camera.aspect =
//         window.innerWidth / window.innerHeight;
//
//     camera.updateProjectionMatrix();
//
// });

function resizeRenderer() {

    const canvas =
        document.getElementById('particleCanvas');

    if (!canvas) return;


    const width =
        window.innerWidth;


    const height =
        Math.max(
            window.innerHeight,
            1
        );


    renderer.setSize(
        width,
        height,
        false
    );


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();

}


window.addEventListener(
    'resize',
    resizeRenderer
);


resizeRenderer();

// 2. Setup Particles (Swarming Orbs)
const particleCount = 1300;


// Use a SphereGeometry for the orbs
const geometry =
    new THREE.SphereGeometry(
        0.03,
        5,
        16
    );


// Use a MeshPhongMaterial for a nice 3D lighting effect
const material =
    new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 80
    });


// Add lights to make the orbs dimensional
const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.6
    );

scene.add(ambientLight);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        0.8
    );

directionalLight.position.set(
    10,
    20,
    10
);

scene.add(directionalLight);


// Create instanced particle mesh
const instancedMesh =
    new THREE.InstancedMesh(
        geometry,
        material,
        particleCount
    );

scene.add(instancedMesh);


// Google Brand Colors
const colors = [

    new THREE.Color('#4285F4'), // Blue
    new THREE.Color('#EA4335'), // Red
    new THREE.Color('#FBBC05'), // Yellow
    new THREE.Color('#34A853')  // Green

];


// Track mouse and mode state
const targetPosition =
    new THREE.Vector3(
        0,
        0,
        0
    );


// Initialize origin in upper-left portion of screen
(function initOrigin() {

    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const vec =
        new THREE.Vector3(
            -0.4,
            0.4,
            0.5
        );

    vec.unproject(camera);

    const dir =
        vec
            .sub(camera.position)
            .normalize();

    const distance =
        -camera.position.z / dir.z;

    targetPosition
        .copy(camera.position)
        .add(
            dir.multiplyScalar(distance)
        );

})();


const dummy =
    new THREE.Object3D();

const particleData = [];


// Initialize particles
for (
    let i = 0;
    i < particleCount;
    i++
) {

    dummy.position.set(

        targetPosition.x +
            (Math.random() - 0.5) * 10,

        targetPosition.y +
            (Math.random() - 0.5) * 10,

        targetPosition.z +
            (Math.random() - 0.5) * 10

    );


    dummy.updateMatrix();

    instancedMesh.setMatrixAt(
        i,
        dummy.matrix
    );


    // Assign color
    const color =
        colors[
            Math.floor(
                Math.random() *
                colors.length
            )
        ];

    instancedMesh.setColorAt(
        i,
        color
    );


    // Give each orb a random target offset
    const radius =
        Math.random() * 5 + 1.0;

    const theta =
        Math.random() *
        Math.PI *
        2;

    const phi =
        Math.acos(
            (Math.random() * 2) - 1
        );


    particleData.push({

        position:
            dummy.position.clone(),

        velocity:
            new THREE.Vector3(
                0,
                0,
                0
            ),

        offset:
            new THREE.Vector3(

                radius *
                Math.sin(phi) *
                Math.cos(theta),

                radius *
                Math.sin(phi) *
                Math.sin(theta),

                radius *
                Math.cos(phi)

            ),

        mass:
            Math.random() *
            0.5 +
            0.5,

        springFactor:
            Math.random() *
            0.0001 +
            0.005

    });

}


// Particle modes
let activeMode = 'swarm';

let modeInfluence = 0;


// Expose mode switcher to window
window.setParticleMode = (mode) => {

    activeMode = mode;

};


// Mouse movement
window.addEventListener(
    'mousemove',
    (event) => {

        const vec =
            new THREE.Vector3(

                (
                    event.clientX /
                    window.innerWidth
                ) * 2 - 1,

                -(
                    event.clientY /
                    window.innerHeight
                ) * 2 + 1,

                0.5

            );


        vec.unproject(camera);


        const dir =
            vec
                .sub(camera.position)
                .normalize();


        const distance =
            -camera.position.z /
            dir.z;


        targetPosition
            .copy(camera.position)
            .add(
                dir.multiplyScalar(
                    distance
                )
            );

    }
);


// =========================================
// NUORASI HERO READY SIGNAL
// =========================================

let nuorasiHeroReadySent = false;


function signalNuorasiHeroReady() {

    // Only send the message once
    if (nuorasiHeroReadySent) {

        return;

    }


    nuorasiHeroReadySent = true;


    /*
     * Wait one additional browser frame
     * after Three.js renders.
     *
     * This gives the browser an opportunity
     * to actually paint the particle canvas
     * before the Wix loading overlay fades.
     */
    requestAnimationFrame(() => {


        const readyMessage = {

            type:
                'nuorasi-particles-ready'

        };


        /*
         * Normal Wix HTML embed case:
         *
         * Send the message from the iframe
         * to the parent Wix page.
         */
        if (
            window.parent &&
            window.parent !== window
        ) {

            window.parent.postMessage(
                readyMessage,
                '*'
            );

        }


        /*
         * Also support the case where this
         * code happens to execute directly
         * inside the parent document.
         */
        window.dispatchEvent(

            new CustomEvent(
                'nuorasi-particles-ready'
            )

        );


        console.log(
            "Particle hero: READY message sent"
        );

    });

}


// =========================================
// 3. Animation Loop with swarming physics
// =========================================

let cycleStartTime =
    performance.now() / 1000;

let currentCycleDuration =
    3.0;


// Main animation
function animate() {

    requestAnimationFrame(
        animate
    );


    // Handle mode transition
    if (
        activeMode !== 'swarm'
    ) {

        modeInfluence =
            Math.min(
                1,
                modeInfluence +
                0.03
            );

    } else {

        modeInfluence =
            Math.max(
                0,
                modeInfluence -
                0.03
            );

    }


    const time =
        performance.now() /
        1000;


    let progress =
        (
            time -
            cycleStartTime
        ) /
        currentCycleDuration;


    // Reset cycle
    if (
        progress >= 1.0
    ) {

        cycleStartTime =
            time;

        progress = 0;

        currentCycleDuration =
            2.0 +
            Math.random() *
            3.0;

    }


    // Jellyfish-style undulation curve
    const undulationFactor =
        progress < 0.2

        ? 1.2 -
          (
            Math.sin(
                (
                    progress /
                    0.2
                ) *
                (
                    Math.PI /
                    2
                )
            ) *
            0.5
          )

        : 0.7 +
          (
            Math.pow(
                (
                    progress -
                    0.2
                ) /
                0.8,
                0.3
            ) *
            0.5
          );


    for (
        let i = 0;
        i < particleCount;
        i++
    ) {

        const data =
            particleData[i];


        // ---------------------------
        // 1. Swarm target
        // ---------------------------

        const swarmOffset =
            data
                .offset
                .clone()
                .multiplyScalar(
                    undulationFactor
                );


        const swarmTarget =
            targetPosition
                .clone()
                .add(
                    swarmOffset
                );


        // ---------------------------
        // 2. Shape target
        // ---------------------------

        let shapeTarget =
            swarmTarget.clone();


        // Brackets mode
        if (
            activeMode ===
            'brackets'
        ) {

            const size = 3.8;

            const horizLen = 0.8;

            const segment =
                i % 6;


            const jitterX =
                (
                    Math.random() -
                    0.5
                ) *
                0.8;


            const jitterY =
                (
                    Math.random() -
                    0.5
                ) *
                0.8;


            const t =
                (
                    i % 50
                ) /
                50;


            if (
                segment === 0
            ) {

                // Left Top Cap

                shapeTarget.set(

                    targetPosition.x -
                    size +
                    t *
                    horizLen +
                    jitterX,

                    targetPosition.y +
                    size +
                    jitterY,

                    0

                );

            }
            else if (
                segment === 1
            ) {

                // Left Bottom Cap

                shapeTarget.set(

                    targetPosition.x -
                    size +
                    t *
                    horizLen +
                    jitterX,

                    targetPosition.y -
                    size +
                    jitterY,

                    0

                );

            }
            else if (
                segment === 2
            ) {

                // Left Vertical Body

                shapeTarget.set(

                    targetPosition.x -
                    size +
                    jitterX,

                    targetPosition.y -
                    size +
                    t *
                    (
                        size *
                        2
                    ) +
                    jitterY,

                    0

                );

            }
            else if (
                segment === 3
            ) {

                // Right Top Cap

                shapeTarget.set(

                    targetPosition.x +
                    size -
                    t *
                    horizLen +
                    jitterX,

                    targetPosition.y +
                    size +
                    jitterY,

                    0

                );

            }
            else if (
                segment === 4
            ) {

                // Right Bottom Cap

                shapeTarget.set(

                    targetPosition.x +
                    size -
                    t *
                    horizLen +
                    jitterX,

                    targetPosition.y -
                    size +
                    jitterY,

                    0

                );

            }
            else if (
                segment === 5
            ) {

                // Right Vertical Body

                shapeTarget.set(

                    targetPosition.x +
                    size +
                    jitterX,

                    targetPosition.y -
                    size +
                    t *
                    (
                        size *
                        2
                    ) +
                    jitterY,

                    0

                );

            }

        }


        // Circle mode
        else if (
            activeMode ===
            'circle'
        ) {

            const radius = 4;


            const thickRadius =
                radius +
                (
                    Math.random() -
                    0.5
                ) *
                0.8;


            const angle =
                (
                    i /
                    particleCount
                ) *
                Math.PI *
                2 +
                time *
                0.8;


            shapeTarget.set(

                targetPosition.x +
                Math.cos(angle) *
                thickRadius,

                targetPosition.y +
                Math.sin(angle) *
                thickRadius,

                0

            );

        }


        // ---------------------------
        // Blend targets
        // ---------------------------

        const finalTarget =
            new THREE
                .Vector3()
                .lerpVectors(

                    swarmTarget,
                    shapeTarget,
                    modeInfluence

                );


        // ---------------------------
        // Spring force
        // ---------------------------

        const force =
            finalTarget
                .sub(
                    data.position
                )
                .multiplyScalar(
                    data.springFactor
                );


        // Acceleration = Force / Mass
        data.velocity.add(

            force.divideScalar(
                data.mass
            )

        );


        // Friction / damping
        data.velocity.multiplyScalar(
            0.8
        );


        // Update particle position
        data.position.add(
            data.velocity
        );


        dummy.position.copy(
            data.position
        );


        dummy.scale.set(
            1,
            1,
            1
        );


        dummy.updateMatrix();


        instancedMesh.setMatrixAt(
            i,
            dummy.matrix
        );

    }


    // Tell Three.js the instances changed
    instancedMesh
        .instanceMatrix
        .needsUpdate = true;


    // Render the completed particle scene
    renderer.render(
        scene,
        camera
    );


    /*
     * After the FIRST successful render,
     * tell the parent Wix page that
     * the hero is ready.
     */
    signalNuorasiHeroReady();

}


// Start animation loop
animate();
console.log(
    "Canvas final size:",
    renderer.domElement.width,
    renderer.domElement.height
);

console.log(
    "Canvas CSS:",
    renderer.domElement.getBoundingClientRect()
);
