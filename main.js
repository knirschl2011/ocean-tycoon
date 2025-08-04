// Device detection
const deviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isMac: /Mac|iPhone|iPod|iPad/i.test(navigator.platform),
    hasTrackpad: false
};

if (deviceInfo.isMac && !deviceInfo.isMobile) {
    deviceInfo.hasTrackpad = true;
}

// Game state
const gameState = {
    oxygen: 100,
    power: 85,
    minerals: 0,
    credits: 500,
    depth: 0,
    nearCollectable: null,
    submarine: null,
    camera: null,
    scene: null,
    renderer: null,
    collectables: [],
    particles: [],
    fish: [],
    isAtSurface: false,
    pressureZone: "Surface",
    oxygenConsumption: 0.02,
    powerEfficiency: 1.0,
    lastOxygenWarning: 0,
    upgrades: {
        hull: 1, // Starting hull level
    },
    // Physics properties
    velocity: new THREE.Vector3(),
    angularVelocity: new THREE.Vector3(),
    targetVelocity: new THREE.Vector3(),
    targetAngularVelocity: new THREE.Vector3(),
    clock: new THREE.Clock(),
    powerDepletedNotified: false,
};

// Input handling
const keys = {};
const mouse = { x: 0, y: 0, sensitivity: deviceInfo.hasTrackpad ? 0.001 : 0.002 };

// Initialize the game
function init() {
    // Scene setup
    gameState.scene = new THREE.Scene();
    gameState.scene.fog = new THREE.Fog(0x001122, 50, 200);

    // Camera setup
    gameState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup
    const canvas = document.getElementById('gameCanvas');
    gameState.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameState.renderer.setClearColor(0x001133);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x004080, 0.3);
    gameState.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x87ceeb, 0.8);
    directionalLight.position.set(0, 50, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    gameState.scene.add(directionalLight);

    // Create submarine
    createSubmarine();
    
    // Create ocean floor
    createOceanFloor();
    
    // Create collectables
    createCollectables();
    
    // Create marine life
    createMarineLife();
    
    // Create particles
    createParticles();

    // Setup device-specific UI
    setupDeviceUI();

    // Start game loop
    animate();
}

function createSubmarine() {
    const subGroup = new THREE.Group();
    
    // Main hull (using cylinder with rounded ends)
    const hullGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4, 12);
    const hullMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x336699,
        shininess: 100 
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.z = Math.PI / 2;
    subGroup.add(hull);
    
    // Hull end caps for rounded submarine look
    const endCapGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const frontCap = new THREE.Mesh(endCapGeometry, hullMaterial);
    frontCap.position.x = 2;
    frontCap.scale.x = 0.5;
    subGroup.add(frontCap);
    
    const backCap = new THREE.Mesh(endCapGeometry, hullMaterial);
    backCap.position.x = -2;
    backCap.scale.x = 0.5;
    subGroup.add(backCap);

    // Conning tower
    const towerGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8);
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x2a5599 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 0.5;
    subGroup.add(tower);

    // Animated main propeller
    const mainPropGroup = new THREE.Group();
    const propShaftGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const propShaftMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const propShaft = new THREE.Mesh(propShaftGeometry, propShaftMaterial);
    propShaft.rotation.z = Math.PI / 2;
    mainPropGroup.add(propShaft);

    // Propeller blades
    for (let i = 0; i < 3; i++) {
        const bladeGeometry = new THREE.BoxGeometry(0.05, 1.8, 0.2);
        const bladeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.rotation.z = (i * Math.PI * 2) / 3;
        blade.position.x = 0.1;
        mainPropGroup.add(blade);
    }
    
    mainPropGroup.position.set(-2.5, 0, 0);
    subGroup.add(mainPropGroup);

    // Windows
    const windowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const windowMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.8 
    });
    const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    frontWindow.position.set(1.8, 0.2, 0);
    subGroup.add(frontWindow);

    // Side observation windows
    const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow1.position.set(1, 0.2, -0.7);
    sideWindow1.scale.set(0.7, 0.7, 0.7);
    subGroup.add(sideWindow1);
    
    const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
    sideWindow2.position.set(1, 0.2, 0.7);
    sideWindow2.scale.set(0.7, 0.7, 0.7);
    subGroup.add(sideWindow2);

    // LED lights
    const lightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const lightMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff88,
        transparent: true,
        opacity: 0.9 
    });
    
    const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
    leftLight.position.set(2, 0.1, -0.5);
    subGroup.add(leftLight);
    
    const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
    rightLight.position.set(2, 0.1, 0.5);
    subGroup.add(rightLight);

    // Store propeller reference for animation
    subGroup.userData = { mainPropeller: mainPropGroup };

    subGroup.position.set(0, -10, 0);
    gameState.submarine = subGroup;
    gameState.scene.add(subGroup);

    // Position camera behind submarine
    gameState.camera.position.set(-15, -8, 0);
    gameState.camera.lookAt(subGroup.position);
}

function createOceanFloor() {
    // Main seafloor
    const floorGeometry = new THREE.PlaneGeometry(400, 400, 50, 50);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2d4a22,
        transparent: true,
        opacity: 0.9 
    });
    
    // Add some randomness to vertices
    const vertices = floorGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] += Math.random() * 3 - 1.5; // Z coordinate (height)
    }
    floorGeometry.attributes.position.needsUpdate = true;
    floorGeometry.computeVertexNormals();
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -50;
    floor.receiveShadow = true;
    gameState.scene.add(floor);

    // Add some rock formations
    for (let i = 0; i < 20; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 3 + 1);
        const rockMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + Math.random() * 0.3) 
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 200,
            -50 + Math.random() * 3,
            (Math.random() - 0.5) * 200
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        gameState.scene.add(rock);
    }
}

function createCollectables() {
    for (let i = 0; i < 15; i++) {
        const collectableGroup = new THREE.Group();
        
        // Main crystal
        const crystalGeometry = new THREE.OctahedronGeometry(0.8);
        const crystalMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.8, 0.6),
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.5, 0.1)
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        collectableGroup.add(crystal);

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: crystalMaterial.color,
            transparent: true,
            opacity: 0.1
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        collectableGroup.add(glow);

        collectableGroup.position.set(
            (Math.random() - 0.5) * 150,
            -45 + Math.random() * 10,
            (Math.random() - 0.5) * 150
        );
        
        collectableGroup.userData = { 
            type: 'mineral',
            value: Math.floor(Math.random() * 5) + 1,
            rotationSpeed: Math.random() * 0.02 + 0.01,
            bobSpeed: Math.random() * 0.03 + 0.02,
            originalY: collectableGroup.position.y
        };
        
        gameState.collectables.push(collectableGroup);
        gameState.scene.add(collectableGroup);
    }
}

function createMarineLife() {
    for (let i = 0; i < 8; i++) {
        const fishGroup = new THREE.Group();
        
        // Fish body
        const bodyGeometry = new THREE.SphereGeometry(1, 8, 6);
        bodyGeometry.scale(1.5, 0.8, 0.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        fishGroup.add(body);

        // Tail
        const tailGeometry = new THREE.ConeGeometry(0.8, 1.5, 4);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-2, 0, 0);
        tail.rotation.z = Math.PI / 2;
        fishGroup.add(tail);

        fishGroup.position.set(
            (Math.random() - 0.5) * 200,
            -20 + Math.random() * 30,
            (Math.random() - 0.5) * 200
        );
        
        fishGroup.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.2
            ),
            swimRadius: 30 + Math.random() * 20,
            center: fishGroup.position.clone()
        };
        
        gameState.fish.push(fishGroup);
        gameState.scene.add(fishGroup);
    }
}

function createParticles() {
    // Create floating particles (debris, plankton)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 300;     // x
        positions[i + 1] = Math.random() * 100 - 50;    // y
        positions[i + 2] = (Math.random() - 0.5) * 300; // z
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x87ceeb,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    gameState.scene.add(particles);
    gameState.particles.push(particles);
}

function handleInput() {
    const rotationSpeed = 1.5; // Radians per second
    const moveSpeed = 5.0;     // Units per second

    // Reset target velocities each frame
    gameState.targetAngularVelocity.set(0, 0, 0);
    gameState.targetVelocity.set(0, 0, 0);

    // Only allow movement if there is power
    if (gameState.power > 0) {
        // --- Set Target Angular Velocity (Yaw) ---
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
            gameState.targetAngularVelocity.y = rotationSpeed;
        } else if (keys['d'] || keys['D'] || keys['ArrowRight']) {
            gameState.targetAngularVelocity.y = -rotationSpeed;
        }

        // --- Set Target Velocity (Forward/Backward and Up/Down) ---
        if (keys['w'] || keys['W'] || keys['ArrowUp']) {
            gameState.targetVelocity.x = moveSpeed;
        } else if (keys['s'] || keys['S'] || keys['ArrowDown']) {
            gameState.targetVelocity.x = -moveSpeed;
        }

        if (keys[' ']) { // Ascend
            gameState.targetVelocity.y = moveSpeed * 0.7;
        } else if (keys['Shift']) { // Descend
            gameState.targetVelocity.y = -moveSpeed * 0.7;
        }
    }
    
    // --- Actions (can be performed without power) ---
    if (keys['e'] || keys['E']) {
        if (gameState.nearCollectable) {
            collectItem(gameState.nearCollectable);
        }
    }
}

function updatePressureEffects() {
    const depth = gameState.depth;
    const maxDepth = 100 + (gameState.upgrades.hull - 1) * 50; // Max depth increases with hull upgrade

    // Pressure zones with different effects
    if (depth < 10) {
        // Surface zone - safe
        gameState.pressureZone = "Surface";
        gameState.oxygenConsumption = 0.02;
        gameState.powerEfficiency = 1.0;
    } else if (depth < maxDepth * 0.3) {
        // Shallow zone
        gameState.pressureZone = "Shallow";
        gameState.oxygenConsumption = 0.03;
        gameState.powerEfficiency = 1.0;
    } else if (depth < maxDepth * 0.6) {
        // Deep zone - increased strain
        gameState.pressureZone = "Deep";
        gameState.oxygenConsumption = 0.045;
        gameState.powerEfficiency = 0.9;
    } else if (depth < maxDepth) {
        // Abyssal zone - high pressure
        gameState.pressureZone = "Abyssal";
        gameState.oxygenConsumption = 0.06;
        gameState.powerEfficiency = 0.8;
        
        if (Math.random() < 0.005) {
            showNotification("⚠️ High Pressure - Hull Stress Detected!");
        }
    } else {
        // Extreme depths - dangerous
        gameState.pressureZone = "CRUSH DEPTH";
        gameState.oxygenConsumption = 0.15; // Rapid consumption
        gameState.powerEfficiency = 0.6;
        
        if (Math.random() < 0.02) {
            showNotification("🚨 DANGER - HULL INTEGRITY FAILING!");
        }
    }
}

function updateCamera() {
    if (!gameState.submarine || !gameState.camera) return;
    
    const submarine = gameState.submarine;
    const camera = gameState.camera;
    
    // Third-person camera follow
    const idealOffset = new THREE.Vector3(-15, 5, 0);
    idealOffset.applyQuaternion(submarine.quaternion);
    
    const idealPosition = submarine.position.clone().add(idealOffset);
    camera.position.lerp(idealPosition, 0.05);
    
    // Look at submarine with slight offset forward
    const lookAtTarget = submarine.position.clone();
    const forward = new THREE.Vector3(5, 0, 0);
    forward.applyQuaternion(submarine.quaternion);
    lookAtTarget.add(forward);
    
    camera.lookAt(lookAtTarget);
}

function updateCollectables() {
    const submarine = gameState.submarine;
    if (!submarine) return;
    
    gameState.nearCollectable = null;
    let closestDistance = Infinity;
    
    gameState.collectables.forEach((collectable, index) => {
        if (!collectable.parent) return; // Already collected
        
        // Animate
        collectable.rotation.y += collectable.userData.rotationSpeed;
        collectable.position.y = collectable.userData.originalY + 
            Math.sin(Date.now() * collectable.userData.bobSpeed * 0.001) * 0.5;
        
        // Check proximity
        const distance = submarine.position.distanceTo(collectable.position);
        if (distance < 8 && distance < closestDistance) { // Increased detection range
            gameState.nearCollectable = collectable;
            closestDistance = distance;
        }
    });
    
    // Show/hide collect prompt
    const prompt = document.getElementById('collectPrompt');
    if (gameState.nearCollectable) {
        prompt.style.display = 'block';
        // Add a gentle glow effect to the nearest collectable
        gameState.nearCollectable.children[1].material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
    } else {
        prompt.style.display = 'none';
        // Reset glow effects
        gameState.collectables.forEach(collectable => {
            if (collectable.children[1]) {
                collectable.children[1].material.opacity = 0.1;
            }
        });
    }
}

function updateMarineLife() {
    gameState.fish.forEach(fish => {
        const userData = fish.userData;
        
        // Simple AI - swim around in area, avoid submarine
        const toCenter = userData.center.clone().sub(fish.position);
        if (toCenter.length() > userData.swimRadius) {
            userData.velocity.add(toCenter.normalize().multiplyScalar(0.01));
        }
        
        // Avoid submarine
        if (gameState.submarine) {
            const toSubmarine = fish.position.clone().sub(gameState.submarine.position);
            const distance = toSubmarine.length();
            if (distance < 15) {
                userData.velocity.add(toSubmarine.normalize().multiplyScalar(0.05));
            }
        }
        
        // Apply velocity
        fish.position.add(userData.velocity);
        
        // Face movement direction
        if (userData.velocity.length() > 0.001) {
            fish.lookAt(fish.position.clone().add(userData.velocity));
        }
        
        // Damping
        userData.velocity.multiplyScalar(0.98);
        
        // Add some random movement
        userData.velocity.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.003,
            (Math.random() - 0.5) * 0.005
        ));
    });
}

function updateSubmarine() {
    const submarine = gameState.submarine;
    if (!submarine) return;

    // Animate propeller based on movement
    const isMoving = keys['w'] || keys['s'] || keys['a'] || keys['d'] || keys[' '] || keys['Shift'];
    const userData = submarine.userData;
    
    if (userData.mainPropeller && isMoving) {
        userData.mainPropeller.rotation.x += 0.5;
    }
}

function updateResources() {
    // Oxygen regeneration at surface
    if (gameState.isAtSurface && gameState.oxygen < 100) {
        gameState.oxygen += 2.0;
        gameState.oxygen = Math.min(100, gameState.oxygen);
        
        if (Math.random() < 0.01) {
            showNotification("🌊 Surfaced - Oxygen Regenerating!");
        }
    }
    // Consume oxygen based on pressure/depth when submerged
    else if (!gameState.isAtSurface && gameState.oxygen > 0) {
        gameState.oxygen -= gameState.oxygenConsumption;
        gameState.oxygen = Math.max(0, gameState.oxygen);
    }
    
    // Oxygen warnings
    const currentTime = Date.now();
    if (gameState.oxygen <= 30 && gameState.oxygen > 15 && currentTime - gameState.lastOxygenWarning > 3000) {
        showNotification("⚠️ OXYGEN LOW - Consider Surfacing!");
        gameState.lastOxygenWarning = currentTime;
    } else if (gameState.oxygen <= 15 && gameState.oxygen > 5 && currentTime - gameState.lastOxygenWarning > 2000) {
        showNotification("🚨 CRITICAL OXYGEN - Surface NOW!");
        gameState.lastOxygenWarning = currentTime;
    } else if (gameState.oxygen <= 5 && currentTime - gameState.lastOxygenWarning > 1000) {
        showNotification("💀 EMERGENCY - OXYGEN DEPLETED!");
        gameState.lastOxygenWarning = currentTime;
    }
    
    // Consume power when moving
    const isMoving = gameState.targetVelocity.lengthSq() > 0 || gameState.targetAngularVelocity.lengthSq() > 0;
    if (isMoving && gameState.power > 0) {
        const powerConsumption = 0.03 / gameState.powerEfficiency;
        gameState.power -= powerConsumption;
        gameState.power = Math.max(0, gameState.power);
    }
    // Regenerate power when not moving
    else if (!isMoving && gameState.power < 85) {
        gameState.power += 0.08; // Increased regeneration rate
        gameState.power = Math.min(85, gameState.power);
    }

    // Power warnings
    if (gameState.power <= 0 && !gameState.powerDepletedNotified) {
        showNotification("🚨 POWER DEPLETED - Movement Impaired!");
        gameState.powerDepletedNotified = true;
    } else if (gameState.power > 1) {
        // Reset notification flag once power is slightly restored
        gameState.powerDepletedNotified = false;
    }
}

function collectItem(collectable) {
    const userData = collectable.userData;
    gameState.minerals += userData.value;
    gameState.credits += userData.value * 10;
    
    // Remove from scene and array
    gameState.scene.remove(collectable);
    const index = gameState.collectables.indexOf(collectable);
    if (index > -1) {
        gameState.collectables.splice(index, 1);
    }
    
    // Show notification
    showNotification(`+${userData.value} Minerals, +${userData.value * 10} Credits`);
    
    gameState.nearCollectable = null;
}

function showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function updateUI() {
    document.getElementById('oxygenValue').textContent = Math.ceil(gameState.oxygen);
    document.getElementById('oxygenBar').style.width = gameState.oxygen + '%';
    
    document.getElementById('powerValue').textContent = Math.ceil(gameState.power);
    document.getElementById('powerBar').style.width = gameState.power + '%';
    
    document.getElementById('mineralsValue').textContent = gameState.minerals;
    document.getElementById('creditsValue').textContent = gameState.credits;
    document.getElementById('depthValue').textContent = Math.floor(gameState.depth) + 'm';
    
    // Update pressure zone display
    document.getElementById('pressureZone').textContent = gameState.pressureZone;
    
    // Calculate and display pressure
    const atmospheres = Math.floor((gameState.depth / 10) + 1);
    document.getElementById('pressureLevel').textContent = atmospheres + ' ATM';
    
    // Color code the pressure zone based on danger
    const pressureElement = document.getElementById('pressureZone');
    if (gameState.pressureZone === "Surface") {
        pressureElement.style.color = '#00ff88';
    } else if (gameState.pressureZone === "Shallow") {
        pressureElement.style.color = '#88ff00';
    } else if (gameState.pressureZone === "Deep") {
        pressureElement.style.color = '#ffff00';
    } else if (gameState.pressureZone === "Abyssal") {
        pressureElement.style.color = '#ff8800';
    } else {
        pressureElement.style.color = '#ff0000';
    }

    // Update upgrade button
    const upgradeButton = document.getElementById('upgradeHullButton');
    const upgradeCost = 1000 * gameState.upgrades.hull;
    upgradeButton.textContent = `Upgrade Hull (Lvl ${gameState.upgrades.hull + 1}) - ${upgradeCost} Credits`;
    upgradeButton.disabled = gameState.credits < upgradeCost;
}

function purchaseUpgrade(upgradeType) {
    if (upgradeType === 'hull') {
        const cost = 1000 * gameState.upgrades.hull;
        if (gameState.credits >= cost) {
            gameState.credits -= cost;
            gameState.upgrades.hull++;
            showNotification(`Hull Upgraded to Level ${gameState.upgrades.hull}!`);
            updateUI();
        } else {
            showNotification("Not enough credits for hull upgrade!");
        }
    }
}

function updatePhysics(deltaTime) {
    const submarine = gameState.submarine;
    if (!submarine) return;

    // Interpolation factors for smooth acceleration and deceleration
    const linearInterpolation = 0.1;
    const angularInterpolation = 0.15;

    // --- Smoothly interpolate current velocity towards the target velocity ---
    gameState.velocity.lerp(gameState.targetVelocity, linearInterpolation);
    gameState.angularVelocity.lerp(gameState.targetAngularVelocity, angularInterpolation);

    // --- Update Rotation ---
    if (Math.abs(gameState.angularVelocity.y) > 0.001) {
        const deltaRotation = new THREE.Quaternion();
        const angle = gameState.angularVelocity.y * deltaTime;
        const axis = new THREE.Vector3(0, 1, 0);
        deltaRotation.setFromAxisAngle(axis, angle);
        submarine.quaternion.premultiply(deltaRotation);
    }

    // --- Update Position ---
    if (gameState.velocity.lengthSq() > 0.0001) {
        const worldVelocity = gameState.velocity.clone();
        
        // Transform local velocity into world-space direction
        worldVelocity.applyQuaternion(submarine.quaternion);
        
        // Update position
        submarine.position.add(worldVelocity.multiplyScalar(deltaTime));
    }

    // --- Update Game State ---
    gameState.depth = Math.max(0, -submarine.position.y);
    gameState.isAtSurface = submarine.position.y > -10;
    
    updatePressureEffects();
    updateUI();
}

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = gameState.clock.getDelta();

    handleInput();
    updatePhysics(deltaTime); // New physics update function
    updateSubmarine();
    updateCamera();
    updateCollectables();
    updateMarineLife();
    updateResources();
    
    // Animate particles
    gameState.particles.forEach(particles => {
        particles.rotation.y += 0.001;
    });
    
    gameState.renderer.render(gameState.scene, gameState.camera);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch event handlers for mobile/trackpad
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
});

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    // Simple touch steering
    if (e.touches[0] && gameState.submarine) {
        const touch = e.touches[0];
        const centerX = window.innerWidth / 2;
        const deltaX = touch.clientX - centerX;
        
        if (Math.abs(deltaX) > 20) {
            const rotationAngle = -deltaX * 0.0001;
            const rotationQuaternion = new THREE.Quaternion();
            rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle);
            gameState.submarine.quaternion.multiply(rotationQuaternion);
        }
    }
});

// Touch button handlers
document.querySelectorAll('.touch-button').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = true;
        button.style.background = 'rgba(0, 200, 255, 1)';
    });
    
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        const key = button.getAttribute('data-key');
        keys[key] = false;
        button.style.background = 'rgba(0, 150, 255, 0.8)';
    });
});

// Device-specific UI setup
function setupDeviceUI() {
    const inputHint = document.getElementById('inputTypeHint');
    const touchControls = document.getElementById('touchControls');
    const keyboardControls = document.getElementById('controls');
    
    if (deviceInfo.isMobile || deviceInfo.isTouch) {
        inputHint.textContent = 'Touch & drag: Steer';
        touchControls.style.display = 'flex';
    } else if (deviceInfo.hasTrackpad) {
        inputHint.textContent = 'Trackpad: Optimized';
    } else {
        inputHint.textContent = 'Mouse: Look around';
    }
}

window.addEventListener('resize', () => {
    if (gameState.camera && gameState.renderer) {
        gameState.camera.aspect = window.innerWidth / window.innerHeight;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Start the game
window.addEventListener('load', () => {
    init();
    document.getElementById('upgradeHullButton').addEventListener('click', () => {
        purchaseUpgrade('hull');
    });
});