import * as THREE from 'three';
import './style.css';

// --- AUDIO SYNTHESIZER ENGINE (WEB AUDIO API - TANPA FILE EKSTERNAL) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    let now = audioCtx.currentTime;

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (type === 'cultivate') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'battle') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(80, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'upgrade') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
}

window.toggleAudio = function() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-toggle').innerText = soundEnabled ? "🔊 Audio: ON" : "🔇 Audio: OFF";
};

// --- GAME STATE & RESOURCES ---
const gameData = {
    spiritStones: 200,
    materials: 400,
    troops: 60,
    qi: 0,
    nabilaTier: 1,
    tierNames: ["Qi Condensation", "Foundation Establishment", "Core Formation", "Nascent Soul", "Immortal Ascension"],
    territoriesConquered: 1,
    weaponLevel: 1,
    weaponNames: ["Pedang Kayu Roh", "Pedang Besi Hitam", "Pedang Pusaka Naga", "Pedang Surgawi Pembelah Langit"],
    heroesCount: 3
};

function updateUI() {
    document.getElementById('res-spirit').innerText = gameData.spiritStones;
    document.getElementById('res-material').innerText = gameData.materials;
    document.getElementById('res-troops').innerText = gameData.troops;
    document.getElementById('res-qi').innerText = gameData.qi;
    document.getElementById('nabila-level').innerText = `${gameData.tierNames[gameData.nabilaTier - 1]} (Tier ${gameData.nabilaTier})`;
    document.getElementById('res-weapon').innerText = gameData.weaponNames[gameData.weaponLevel - 1];
}

function logMessage(msg) {
    const box = document.getElementById('log-box');
    if (box) {
        box.innerHTML += `<br>[Log] ${msg}`;
        box.scrollTop = box.scrollHeight;
    }
}

// --- THREE.JS 3D ENVIRONMENT SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070712);
scene.fog = new THREE.FogExp2(0x070712, 0.025);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 14, 22);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffccff, 0.7));
const directionalLight = new THREE.DirectionalLight(0xff99ff, 1.3);
directionalLight.position.set(15, 25, 15);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground & Grid (Mystical Terrain)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0x121225, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
scene.add(new THREE.GridHelper(80, 40, 0xff3399, 0x222244));

// --- ASSET 3D: KARAKTER UTAMA (NABILA) SESUAI REFERENSI FOTO ---
const nabilaGroup = new THREE.Group();

// Sepatu Bot Hitam Tinggi
const bootMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.3 });
const leftBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.7), bootMat);
leftBoot.position.set(-0.3, 0.35, 0);
const rightBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.7), bootMat);
rightBoot.position.set(0.3, 0.35, 0);
nabilaGroup.add(leftBoot);
nabilaGroup.add(rightBoot);

// Kaus Kaki Hitam Panjang (Knee-high socks) & Kaki
const sockMat = new THREE.MeshStandardMaterial({ color: 0x151515 });
const leftSock = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 1.1), sockMat);
leftSock.position.set(-0.3, 1.1, 0);
const rightSock = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 1.1), sockMat);
rightSock.position.set(0.3, 1.1, 0);
nabilaGroup.add(leftSock);
nabilaGroup.add(rightSock);

// Kaos Hitam Gothic & Tubuh
const gothicShirtMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.7 });
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.3, 0.55), gothicShirtMat);
torso.position.set(0, 2.25, 0);
nabilaGroup.add(torso);

// Kepala & Wajah
const skinMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3, roughness: 0.6 });
const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), skinMat);
head.position.set(0, 3.15, 0);
nabilaGroup.add(head);

// Rambut Pink Panjang Mencolok
const hairMat = new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.4 });
const hair = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.3, 16), hairMat);
hair.position.set(0, 3.55, -0.05);
hair.rotation.x = 0.15;
nabilaGroup.add(hair);

scene.add(nabilaGroup);

// --- ASSET 3D: MENARA SEKTE & KERAJAAN ---
const structures = [];
function createCastleAsset(x, z, color) {
    const group = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 3.5, 8), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
    tower.position.set(0, 1.75, 0);
    group.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0xff3399 }));
    roof.position.set(0, 4.35, 0);
    group.add(roof);

    group.position.set(x, 0, z);
    scene.add(group);
    structures.push(group);
}

createCastleAsset(-8, -8, 0x2b2b40);
createCastleAsset(8, -8, 0x2b2b40);
createCastleAsset(-8, 8, 0x3d223d);
createCastleAsset(8, 8, 0x3d223d);

// --- ASSET 3D: MONSTER / MUSUH SEKTE LAIN ---
const monsters = [];
function spawnMonster(x, z) {
    const monGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x882244, roughness: 0.6 }));
    body.position.set(0, 0.6, 0);
    monGroup.add(body);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00 }));
    eye.position.set(0, 0.8, 0.6);
    monGroup.add(eye);

    monGroup.position.set(x, 0, z);
    scene.add(monGroup);
    monsters.push(monGroup);
}
spawnMonster(-15, -10);
spawnMonster(15, -15);
spawnMonster(-12, 15);

// --- GAME ACTIONS & INTERACTION (LENGKAP) ---
window.cultivateQi = function() {
    playSound('cultivate');
    gameData.qi += 30 * gameData.nabilaTier;
    logMessage(`Nabila bermeditasi menyerap energi spiritual (+${30 * gameData.nabilaTier} Qi).`);
    if (gameData.qi >= gameData.nabilaTier * 120 && gameData.nabilaTier < 5) {
        gameData.nabilaTier++;
        playSound('upgrade');
        logMessage(`🌟 LUAR BIASA! Nabila naik ke tingkat kultivasi: ${gameData.tierNames[gameData.nabilaTier - 1]}!`);
    }
    updateUI();
};

window.recruitTroops = function() {
    playSound('click');
    if (gameData.spiritStones >= 50) {
        gameData.spiritStones -= 50;
        gameData.troops += 15;
        gameData.heroesCount++;
        logMessage("Prajurit dan Penyihir Sekte baru berhasil direkrut ke barisan pasukan!");
        updateUI();
    } else {
        logMessage("Gagal merekrut: Batu Spiritual kurang (butuh 50 💎)!");
    }
};

window.upgradeWeapon = function() {
    playSound('click');
    const cost = gameData.weaponLevel * 150;
    if (gameData.spiritStones >= cost && gameData.weaponLevel < 4) {
        gameData.spiritStones -= cost;
        gameData.weaponLevel++;
        playSound('upgrade');
        logMessage(`⚔️ Senjata berhasil di-upgrade menjadi: ${gameData.weaponNames[gameData.weaponLevel - 1]}!`);
        updateUI();
    } else if (gameData.weaponLevel >= 4) {
        logMessage("Senjata sudah mencapai tingkat tertinggi (Legendary)!");
    } else {
        logMessage(`Batu Spiritual tidak cukup untuk upgrade senjata (butuh ${cost} 💎)!`);
    }
};

window.buildAsset = function() {
    playSound('click');
    if (gameData.materials >= 100) {
        gameData.materials -= 100;
        const rx = (Math.random() - 0.5) * 25;
        const rz = (Math.random() - 0.5) * 25;
        createCastleAsset(rx, rz, 0x4a2e4a);
        logMessage("Menara pertahanan sekte baru berhasil didirikan di wilayah kerajaan!");
        updateUI();
    } else {
        logMessage("Material bangunan tidak cukup (butuh 100 🪵)!");
    }
};

window.conquerTerritory = function() {
    playSound('battle');
    gameData.territoriesConquered++;
    const rewardSpirit = 120 * gameData.territoriesConquered;
    const rewardMat = 200 * gameData.territoriesConquered;
    gameData.spiritStones += rewardSpirit;
    gameData.materials += rewardMat;
    
    // Hapus monster acak jika ada
    if (monsters.length > 0) {
        const m = monsters.pop();
        scene.remove(m);
    }

    logMessage(`⚔️ PERANG DIMENANGKAN! Pasukan Nabila menaklukkan wilayah baru. Memanen +${rewardSpirit} 💎 & +${rewardMat} 🪵!`);
    updateUI();
};

window.claimResource = function() {
    playSound('click');
    const bonusS = gameData.territoriesConquered * 40;
    const bonusM = gameData.territoriesConquered * 60;
    gameData.spiritStones += bonusS;
    gameData.materials += bonusM;
    logMessage(`Upeti wilayah berhasil diklaim: +${bonusS} Batu Spiritual, +${bonusM} Material.`);
    updateUI();
};

// --- ANIMATION LOOP 3D ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    let time = clock.getElapsedTime();

    // Efek melayang sinematik karakter Nabila
    nabilaGroup.position.y = Math.sin(time * 2.5) * 0.18;
    nabilaGroup.rotation.y = Math.sin(time * 0.6) * 0.35;

    // Putar perlahan kamera sinematik mengelilingi arena kerajaan
    camera.position.x = Math.sin(time * 0.08) * 22;
    camera.position.z = Math.cos(time * 0.08) * 22;
    camera.lookAt(0, 2, 0);

    renderer.render(scene, camera);
}

animate();

// Responsive handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

updateUI();
