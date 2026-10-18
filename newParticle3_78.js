/* Nuorasi particle system | cleaned 2026-10-18
 * Three.js r128. This file exclusively owns the WebGL renderer and camera.
 * Preserves the original 800-particle swarm, colors, motion, and ready signal.
 */

console.log("Hello FROM newParticle.js!!!!!!!!!!!!!! REV 3.78 VERSION: 10-18-26 12:50:00 PM");


(function initNuorasiParticles() {
    'use strict';

    // Avoid creating another WebGL context if this script is injected twice.
    if (window.__nuorasiParticlesActive) {
        console.info('Nuorasi: particle system already initialized; skipping duplicate.');
        return;
    }

    const canvas = document.getElementById('particleCanvas');
    if (!canvas || !window.THREE) {
        console.error('Nuorasi: particle canvas or Three.js library is missing.');
        notifyParticleFailure('Canvas or Three.js missing');
        return;
    }

    function notifyParticleFailure(reason) {
        // The parent can release its preloader and retain the normal hero logo.
        const message = { type: 'nuorasi-particles-error', reason };
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
        window.dispatchEvent(new CustomEvent('nuorasi-particles-error', { detail: message }));
    }

    let renderer;
    let contextLost = false;
    let animationFrameId = null;

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 10;

        // Request one context only; fail gracefully if the GPU refuses it.
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'default'
        });
        window.__nuorasiParticlesActive = true;

        function resizeRenderer() {
            if (contextLost) return;
            const width = Math.max(1, Math.round(window.innerWidth));
            const height = Math.max(1, Math.round(window.innerHeight));
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        // Called by the HTML wrapper when the Wix embed changes size.
        window.nuorasiResizeParticles = resizeRenderer;
        window.addEventListener('resize', resizeRenderer);
        window.addEventListener('orientationchange', resizeRenderer);

        canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            contextLost = true;
            if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
            console.warn('Nuorasi: WebGL context lost');
        });
        canvas.addEventListener('webglcontextrestored', () => {
            contextLost = false;
            resizeRenderer();
            animate();
            console.info('Nuorasi: WebGL context restored');
        });

        resizeRenderer();

// 2. Setup Particles (Swarming Orbs)
        const particleCount = 800;


// Use a SphereGeometry for the orbs
        const geometry =
            new THREE.SphereGeometry(
                0.03,
                5,
                16
            );


// Use a MeshPhongMaterial for a nice 3D lighting effect
// const material =
//     new THREE.MeshPhongMaterial({
//         color: 0xffffff,
//         shininess: 80
//     });

        const material =
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100,
                transparent: true,
                opacity: 0.80
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
            //  new THREE.Color('#539BC4'), // cyan
            // new THREE.Color('#D6Be64')  // gold

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

            // const vec =
            //     new THREE.Vector3(
            //         -0.4,
            //         0.4,
            //         0.5
            //     );

            const vec =
                new THREE.Vector3(
                    0,
                    0,
                    0
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
            10.1;


// Main animation
        function animate() {

            if (contextLost) return;
            animationFrameId = requestAnimationFrame(animate);


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


// Start the particle animation after successful setup.
        animate();
        console.info('Nuorasi particles initialized', {
            width: renderer.domElement.width,
            height: renderer.domElement.height
        });

    } catch (error) {
        window.__nuorasiParticlesActive = false;
        delete window.nuorasiResizeParticles;
        console.error('Nuorasi: unable to initialize particle renderer:', error);
        notifyParticleFailure(error && error.message ? error.message : String(error));
        // No false particles-ready signal. Logo/message animation continues.
    }
})();