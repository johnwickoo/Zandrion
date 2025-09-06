const canvasBackground = document.getElementById('canvas1');
const ctxB = canvasBackground.getContext('2d');
const canvasWidth1 = canvasBackground.width = 1400;
const canvasHeight1 = canvasBackground.height = 700;

let gameSpeed = 15;
let lastTime = performance.now();

const backgroundLayer1 = new Image();
backgroundLayer1.src = 'Resources/cracks1.png';
const backgroundLayer2 = new Image();
backgroundLayer2.src = 'Resources/cracks2.png';
const backgroundLayer3 = new Image();
backgroundLayer3.src = 'Resources/houses1.png';
const backgroundLayer4 = new Image();
backgroundLayer4.src = 'Resources/houses2.png';
const backgroundLayer5 = new Image();
backgroundLayer5.src = 'Resources/houses3.png';
const backgroundLayer6 = new Image();
backgroundLayer6.src = 'Resources/houses4.png';
const backgroundLayer7 = new Image();
backgroundLayer7.src = 'Resources/road.png';
const backgroundLayer8 = new Image();
backgroundLayer8.src = 'Resources/sky.png';
const backgroundLayer9 = new Image();
backgroundLayer9.src = 'Resources/wall.png';

class Layer {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 1400; // Replace with image.width once loaded
        this.height = 700;
        this.x2 = this.width;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }
    update() {
        this.speed = gameSpeed * this.speedModifier;
        this.x -= this.speed;
        this.x2 -= this.speed;
        //game modifier is affected by speed modifierr thats determinant on direction
        if (this.speed > 0) {
            if (this.x <= -this.width) {
                this.x = this.x2 + this.width;
            }
            if (this.x2 <= -this.width) {
                this.x2 = this.x + this.width;
            }
        }

// wrap to the left if going right
        else if (this.speed < 0) {
            if (this.x >= this.width) {
                this.x = this.x2 - this.width;
            }
            if (this.x2 >= this.width) {
                this.x2 = this.x - this.width;
            }
        }
        this.x = Math.floor(this.x - this.speed);
        this.x2 = Math.floor(this.x2 - this.speed);
    }
    draw() {
        ctxB.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctxB.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
}

const layer1 = new Layer(backgroundLayer1, 0.5);
const layer2 = new Layer(backgroundLayer2, 0.3);
const layer3 = new Layer(backgroundLayer3, 0.3);
const layer4 = new Layer(backgroundLayer4, 0.5);
const layer5 = new Layer(backgroundLayer5, 0.4);
const layer6 = new Layer(backgroundLayer6, 0.5);
const layer7 = new Layer(backgroundLayer7, 0.5);
const layer8 = new Layer(backgroundLayer8, 1.5);
const layer9 = new Layer(backgroundLayer9, 0.5);


const layers = [layer9,layer8,layer6,layer5, layer4, layer3, layer2, layer7,layer1];

function backgroundAnimate() {
    ctxB.clearRect(0, 0, canvasWidth1, canvasHeight1);
    layers.forEach(layer => {
        layer.update();
        layer.draw();
    });
    requestAnimationFrame(backgroundAnimate);
}

// Start animation only after all images load
Promise.all([
    backgroundLayer1.decode(),
    backgroundLayer2.decode(),
    backgroundLayer3.decode(),
    backgroundLayer4.decode(),
    backgroundLayer5.decode(),
    backgroundLayer6.decode(),
    backgroundLayer7.decode(),
    backgroundLayer8.decode(),
    backgroundLayer9.decode(),
]).then(() => {
    backgroundAnimate();
});



const canvas = document.getElementById('canvas2');
const ctx = canvas.getContext('2d');
canvas.width = 1400;
canvas.height = 700;

const playerImage = new Image();
playerImage.src = "Resources/Warrior_Sheet-Effect.png";

const playerWidth = 69;
const playerHeight = 44;
let gameFrames = 0;
const staggerFrames = 5; // controls animation speed
const gravity=2000;
// Key states
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    Space: false,
    t:false
}

window.addEventListener('keydown', e => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
window.addEventListener('keyup', e => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});
window.addEventListener('keydown', e => {
    if (e.code === "Space") {
        keys.Space = true;
    } else if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});
window.addEventListener('keyup', e => {
    if (e.code === "Space") {
        keys.Space = false;
    } else if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});
window.addEventListener('click',(e)=>{
   const x = e.x
   const y = e.y
    player.teleport(x,y);
})


//include stamina and remove jump limiters and have jump cos that as well as attacks, add mana too and health
// Animation states definition
const animationState = [
    { name: 'idle', frames: 6 }, 
    { name: 'run', frames: 6 }, 
    { name: 'fall', frames: 6 },
    { name: 'dizzy', frames: 11 },
    { name: 'sit', frames: 5 },
    { name: 'roll', frames: 7 },
    { name: 'jump', frames: 4 },
    { name: 'bite', frames: 7 },
    { name: 'ko', frames: 12 },
    { name: 'getHit', frames: 4 }
];

// Build animation lookup
const playerAnimation = {};
animationState.forEach((state, index) => {
    let frames = { loc: [] };
    for (let j = 0; j < state.frames; j++) {
        let positionX = j * playerWidth;
        let positionY = index * playerHeight;
        frames.loc.push({ x: positionX, y: positionY });
    }
    playerAnimation[state.name] = frames;
});




let prevFacing=false
let jumpPressed=false; 
class Player {
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.playerWidth=playerWidth*this.scale;
        this.playerHeight=playerHeight*this.scale
        this.state = "idle";
        this.speed = 600;
        this.speedY = 0;
        this.gravity = gravity;  // tweak this for jump feel
        this.jumpStrength = 800;
        this.isOnGround = false;
        this.groundY = canvas.height - playerHeight * this.scale*1.3;
        this.facingLeft=false;
        this.facingRight=true;
        this.targetX=null;
        this.targetY=null;
        this.acceleration=30000;
        this.maxSpeed = 25;
        this.vx=0;
        this.vy=0;
       
        // Combat & stats
        this.name = "Player";
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 10;                // physical armor
        this.magicResistance = 5;       // magical resistance
        this.poisonResistance = 2;      // poison resistance
        this.statusEffects = [];
        this.canMove = true; 

    }

    update(deltaTime) {
       
        
        if(this.canMove){
            // Horizontal movement
        if (keys.ArrowRight || keys.d) {
            this.x += this.speed* deltaTime;
            if (this.isOnGround) this.state = "run";
            this.facingLeft = false;
            this.facingRight=true
        } else if (keys.ArrowLeft || keys.a) {
            this.x -= this.speed * deltaTime;
            this.facingLeft = true;
            this.facingRight=false
            if (this.isOnGround) this.state = "run";
        } else {
            if (this.isOnGround) this.state = "idle";
        }
        
        if (this.facingLeft && !prevFacing) {
            layers.forEach(layer => {
                layer.speedModifier *= -1;
                prevFacing=true
            });
        }else if(this.facingRight && prevFacing){
            layers.forEach(layer => {
                layer.speedModifier *= -1;
                 prevFacing=false
            });
        }
        // Jumping
        
        if (keys.Space && !jumpPressed) {
            if (this.isOnGround && playerStamina.currentHealth >= 50) {
                this.speedY = -this.jumpStrength;
                this.isOnGround = false;
                this.state = "jump";
                playerStamina.decreaseStat(50);
            } 
            else if (!this.isOnGround && this.y > canvas.height * 0.3 && playerStamina.currentHealth >= 10) {
                this.speedY = -this.jumpStrength;
                this.state = "jump";
                playerStamina.decreaseStat(10);
            }
    jumpPressed = true;
    }


        if (!keys.Space) {
            jumpPressed = false;
        }

                // Apply gravity
        if (this.y < canvas.height * 0.2) {
            this.gravity = 20000; 
        } else {
            this.gravity = gravity;
        }
        
       this.speedY += this.gravity* deltaTime;
        this.y += this.speedY* deltaTime;
       
        // Landing on ground
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.speedY = 0;
            this.gravity=gravity
            this.isOnGround = true;
            if (!(keys.ArrowLeft || keys.a || keys.ArrowRight || keys.d)) {
                this.state = "run";
            } else {
                this.state = "run";
            }
            playerStamina.increaseStat(1)
        } else {
            // In air and falling
            if (this.speedY > 0) {
                this.state = "fall";
            }
        }

        //teleporting using targetX and ty

          if (this.targetX !== null && this.targetY !== null) {
                let dx = this.targetX - this.x;
                let dy = this.targetY - this.y;

                let dist = Math.sqrt((dx * dx) + (dy * dy));

            if (dist > 100) { // still far from destination
                let dirX = dx / dist;
                let dirY = dy / dist;

                // Apply acceleration 
                this.vx += dirX * this.acceleration * deltaTime;  
                this.vy += dirY * this.acceleration * deltaTime;  

                // Update position
                this.x += this.vx * deltaTime;
                this.y += this.vy * deltaTime;
                 

                console.log("Moving:", "dx:",dx, "dy:",dy, "dist:",dist,"dirX:",dirX,"dirY:",dirY,this.vx);
            } else {
                // Reached destination
                this.vx = 0;
                this.vy = 0;
                this.x = this.targetX;
                this.y = this.targetY;

                console.log("Arrived at target:", this.targetX, this.targetY);


                this.targetX = null;
                this.targetY = null;
            }
        }

        if(keys.t && this.canMove){
           this.attack()
            
        }

        // Prevent going off screen horizontally
        this.x = Math.max(0, Math.min(canvas.width - playerWidth * this.scale, this.x));
        // Prevent going above top of canvas
        this.y = Math.max(0, this.y);

        }
        updateStatusEffects(this, deltaTime);
    }

    teleport(x,y){
        // let thisHasteleported=false
        if(playerStamina.currentHealth>=50){
            this.targetX = x - (playerWidth * this.scale) / 2;
            this.targetY = y - (playerHeight * this.scale) / 2;
            playerStamina.decreaseStat(50);

        
        }
        }
    attack(){
       fireball.playAnimation(ctx, 0, 100, 100);
    }
    getBoundingBox() {
            return {
                x: this.x,
                y: this.y,
                width: this.playerWidth*0.5,
                height: this.playerHeight
            };
    }

    draw() {
    let position = Math.floor(gameFrames / staggerFrames) % playerAnimation[this.state].loc.length;
    let frameX = playerAnimation[this.state].loc[position].x;
    let frameY = playerAnimation[this.state].loc[position].y;
    
    ctx.save();
   
    if (this.facingLeft && !this.facingRight) {
         
    //facing left mechanics
    // ctx.strokeRect(this.x+playerWidth,this.y+playerHeight,this.playerWidth*0.5,this.playerHeight*2/3);
        ctx.translate(this.x + this.playerWidth / 2, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(
            playerImage,
            frameX, frameY, playerWidth, playerHeight,
            -playerWidth * this.scale / 2, 0,
            this.playerWidth, this.playerHeight
        );

    } else {
        // ctx.strokeRect(this.x+playerWidth/2,this.y+playerHeight,this.playerWidth*0.5,this.playerHeight*2/3);
        ctx.drawImage(
            playerImage,
            frameX, frameY, playerWidth, playerHeight,
            this.x, this.y,
            this.playerWidth, this.playerHeight
        );
    }
    ctx.restore();
}

}

const player = new Player(200, 550, 3);

function gameLoop(currentTime) {

    const deltaTime = (currentTime - lastTime) / 1000; 
    lastTime = currentTime;


    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     
//    targetCharacter(block, player);

    player.update(deltaTime);
    player.draw();
   
    playerHealth.update();
    playerHealth.draw();

    playerStamina.update();
    playerStamina.draw()

    playerMana.update();
    playerMana.draw();
   
    block.update();
    block.draw();

    fireball.update(block.x,block.y);
    fireball.draw(ctxAttacks)

    boss.update(deltaTime);
    boss.draw(ctx);

    resolveCollision(player, block);


    gameFrames++;
    
    
    
    ctx.restore()
    requestAnimationFrame(gameLoop);
    
}

requestAnimationFrame(gameLoop);


//stats ui
const canvasStat = document.getElementById("canvas3");
const ctxStats = canvasStat.getContext("2d");
canvasStat.width = 1400;
canvasStat.height = 700;

class HealthBar {
    constructor(x, y, width, height, maxHealth, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.minHealth=0
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.color = color;
    }

    update(){
        
        
    }
    increaseStat(health){
        this.currentHealth+=health
        if(this.currentHealth >= this.maxHealth){
            this.currentHealth=this.maxHealth
        }
    }
    decreaseStat(damage){
         this.currentHealth-=damage
         if(this.currentHealth <= this.minHealth){
            this.currentHealth=this.minHealth
        }
       
    }

    draw() {
        // Background bar
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Health bar (foreground)
        const healthRatio = this.currentHealth / this.maxHealth;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width * healthRatio, this.height);

        // Optional border
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

const playerHealth = new HealthBar(20, 20, 200, 20, 100,'red');
const playerStamina = new HealthBar(20, 40, 400, 20, 500,'green');
const playerMana = new HealthBar(20, 60, 600, 20, 800,'blue');



class Boss{
    constructor(){
        this.x=(Math.random()*canvasWidth1);
        this.y=(Math.random()*canvasHeight1);
        this.width=50;
        this.height=50;
        this.damage=5;
        this.speed=10;
        this.vx=0;
        this.vy=0
        this.acceleration=30;
        this.health=100
        
    }
    update(){
    //   this.x -= this.speed;
    }
    getBoundingBox() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
    }

    draw(){
        ctxStats.clearRect(0, 0, canvasStat.width, canvasStat.height);
        if(this.health>=0){
            ctxStats.fillStyle = 'grey';
            ctxStats.fillRect(this.x, this.y, this.width, this.height);
        }
        
    }
}

const block = new Boss();


function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&   // rect1’s left edge is left of rect2’s right edge
        rect1.x + rect1.width > rect2.x &&   // rect1’s right edge is right of rect2’s left edge
        rect1.y < rect2.y + rect2.height &&  // rect1’s top edge is above rect2’s bottom edge
        rect1.y + rect1.height > rect2.y     // rect1’s bottom edge is below rect2’s top edge
    );
}
function resolveCollision(player, block) {
    const playerBox = player.getBoundingBox();
    const blockBox = block.getBoundingBox();
     
    

    if (!isColliding(blockBox, playerBox)) return;

    // Calculate overlap on each axis
    const overlapX = Math.min(
        playerBox.x + playerBox.width - blockBox.x,
        blockBox.x + blockBox.width - playerBox.x
    );
    const overlapY = Math.min(
        playerBox.y + playerBox.height - blockBox.y,
        blockBox.y + blockBox.height - playerBox.y
    );

    // Resolve in the axis of least penetration
    if (overlapX < overlapY) {
        // Horizontal collision
        if (playerBox.x < blockBox.x) {
            // Player is on the left
            player.x = blockBox.x - playerBox.width;
        } else {
            // Player is on the right
            playerBox.x = block.x + block.width;
            // console.log("playerx"+player.x,"blockbox"+blockBox.x,"playerbox"+playerBox.x,"blockx"+block.x,"blockx and width"+block.x+block.width)
        }
        player.vx = 0; // stop horizontal speed only
    } else {
        // Vertical collision
        if (player.y < blockBox.y) {
            // Player is above
            player.y = blockBox.y - playerBox.height;
            player.onGround = true; // optional: mark standing on block
        } else {
            // Player is below
            player.y = blockBox.y + blockBox.height;
        }
        player.vy = 0; // stop vertical speed only
    }
}


function targetCharacter(block, player) {
    const playerBox = player.getBoundingBox();
    const blockBox = block.getBoundingBox();


    
    // Move block slowly toward player
    const dx = playerBox.x - blockBox.x;
    const dy = playerBox.y - blockBox.y;
   

    // Normalize and step toward player
    const speed = 10; // adjust to taste
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 1) {
        block.x += (dx / dist) * speed;
        block.y += (dy / dist) * speed;
    //     playerBox.x=null;
    // playerBox.y=null
    }else{
        console.log("im here")
        playerHealth.decreaseStat(0.1)
    }
    
}


const canvasAttacks = document.getElementById('canvas4');
const ctxAttacks = canvasAttacks.getContext('2d');
canvasAttacks.width = 1400;
canvasAttacks.height = 700;

const attackLibrary = [
  { 
    id: 0, 
    name: "Melee", 
    type: "damageDealer", 
    damage: 5, 
    range: 1000, 
    castDuration: 0, 
    manaCost: 0, 
    cooldown: 0, 
    availability: true, 
    imageSrc:'background.jpg', 
    framesX:8, 
    imgWidth:576, 
    imgHeight:72,
    damageType: 'physical',
    critChance: 0.05,
    critMultiplier: 1.5,
    armorPenetration: 0,
    statusEffects: [],
    knockback: 2,
    phase: 1
  },
  { 
    id: 1, 
    name: "Fireball", 
    type: "damageDealer", 
    damage: 20, 
    range: 15, 
    castDuration: 1.5, 
    manaCost: 10, 
    cooldown: 3, 
    availability: true,
    damageType: 'fire',
    critChance: 0.15,
    critMultiplier: 2.2,
    armorPenetration: 10,
    statusEffects: [{ type: 'burn', target: 'enemy', duration: 3, damage: 2 }],
    knockback: 5,
    phase: 1
  },
  { 
    id: 2, 
    name: "Ice Spike", 
    type: "damageDealer", 
    damage: 15, 
    range: 12, 
    castDuration: 1, 
    manaCost: 8, 
    cooldown: 2.5, 
    availability: true,
    damageType: 'ice',
    critChance: 0.12,
    critMultiplier: 1.8,
    armorPenetration: 15,
    statusEffects: [{ type: 'slow', target: 'enemy', duration: 4, speedReduction: 0.1 }],
    knockback: 3,
    phase: 1
  },
  { 
    id: 3, 
    name: "Lightning Bolt", 
    type: "damageDealer", 
    damage: 25, 
    range: 20, 
    castDuration: 2, 
    manaCost: 15, 
    cooldown: 4, 
    availability: true,
    damageType: 'lightning',
    critChance: 0.20,
    critMultiplier: 2.5,
    armorPenetration: 25,
    statusEffects: [{ type: 'stun', target: 'enemy', duration: 5 }],
    knockback: 8,
    phase: 1
  },
  { 
    id: 4, 
    name: "Heal", 
    type: "support", 
    damage: -20, 
    range: 10, 
    castDuration: 1.5, 
    manaCost: 12, 
    cooldown: 5, 
    availability: true,
    damageType: 'healing',
    critChance: 0.10,
    critMultiplier: 1.5,
    statusEffects: [{ type: 'regeneration', target: 'self', duration: 5, healing: 2 }],
    knockback: 0,
    phase: 1
  },
  { 
    id: 5, 
    name: "Shield", 
    type: "defense", 
    damage: 0, 
    range: 0, 
    castDuration: 0.5, 
    manaCost: 5, 
    cooldown: 3, 
    availability: true,
    damageType: 'defense',
    shieldAmount: 15,
    duration: 10,
    statusEffects: [{ type: 'shield', target: 'self', duration: 10, absorption: 15 }],
    knockback: 0,
    phase: 2
  },
  { 
    id: 6, 
    name: "Poison Dart", 
    type: "damageDealer", 
    damage: 12, 
    range: 10, 
    castDuration: 1, 
    manaCost: 6, 
    cooldown: 2, 
    availability: true,
    damageType: 'poison',
    critChance: 0.08,
    critMultiplier: 1.6,
    armorPenetration: 30,
    statusEffects: [{ type: 'poison', target: 'enemy', duration: 6, damage: 3 }],
    knockback: 1,
    phase: 2
  },
  { 
    id: 7, 
    name: "Earthquake", 
    type: "damageDealer", 
    damage: 30, 
    range: 8, 
    castDuration: 3, 
    manaCost: 20, 
    cooldown: 6, 
    availability: true,
    damageType: 'earth',
    critChance: 0.25,
    critMultiplier: 2.0,
    armorPenetration: 5,
    statusEffects: [{ type: 'knockdown', target: 'enemy', duration: 2 }],
    knockback: 12,
    areaOfEffect: true,
    phase: 2
  },
  { 
    id: 8, 
    name: "Wind Slash", 
    type: "damageDealer", 
    damage: 18, 
    range: 14, 
    castDuration: 1, 
    manaCost: 8, 
    cooldown: 2, 
    availability: true,
    damageType: 'wind',
    critChance: 0.18,
    critMultiplier: 2.1,
    armorPenetration: 20,
    statusEffects: [],
    knockback: 6,
    phase: 2
  },
  { 
    id: 9, 
    name: "Fire Shield", 
    type: "defense", 
    damage: 0, 
    range: 0, 
    castDuration: 0.5, 
    manaCost: 10, 
    cooldown: 4, 
    availability: true,
    damageType: 'fire',
    shieldAmount: 20,
    reflectDamage: 5,
    statusEffects: [{ type: 'fire_shield', target: 'self', duration: 8, reflection: 5 }],
    knockback: 0,
    phase: 3
  },
  { 
    id: 10, 
    name: "Arcane Blast", 
    type: "damageDealer", 
    damage: 22, 
    range: 16, 
    castDuration: 1.2, 
    manaCost: 12, 
    cooldown: 3.5, 
    availability: true,
    damageType: 'arcane',
    critChance: 0.22,
    critMultiplier: 2.3,
    armorPenetration: 35,
    statusEffects: [{ type: 'mana_burn', target: 'enemy', duration: 3, manaDrain: 5 }],
    knockback: 4,
    phase: 3
  },
  { 
    id: 11, 
    name: "Healing Wave", 
    type: "support", 
    damage: -15, 
    range: 12, 
    castDuration: 1.8, 
    manaCost: 10, 
    cooldown: 4, 
    availability: true,
    damageType: 'healing',
    critChance: 0.15,
    critMultiplier: 1.8,
    statusEffects: [{ type: 'healing_over_time', target: 'self', duration: 4, healing: 3 }],
    knockback: 0,
    areaOfEffect: true,
    phase: 3
  },
  { 
    id: 12, 
    name: "Shadow Strike", 
    type: "damageDealer", 
    damage: 28, 
    range: 10, 
    castDuration: 1.5, 
    manaCost: 18, 
    cooldown: 5, 
    availability: true,
    damageType: 'shadow',
    critChance: 0.30,
    critMultiplier: 2.8,
    armorPenetration: 40,
    statusEffects: [{ type: 'fear', target: 'enemy', duration: 2 }],
    knockback: 2,
    phase: 3
  },
  { 
    id: 13, 
    name: "Thunderstorm", 
    type: "damageDealer", 
    damage: 35, 
    range: 20, 
    castDuration: 2.5, 
    manaCost: 25, 
    cooldown: 7, 
    availability: true,
    damageType: 'lightning',
    critChance: 0.28,
    critMultiplier: 3.0,
    armorPenetration: 20,
    statusEffects: [
      { type: 'chain_lightning', target: 'enemy', duration: 1, jumps: 3 },
      { type: 'paralysis', target: 'enemy', duration: 2 }
    ],
    knockback: 10,
    areaOfEffect: true,
    phase: 3
  },
  { 
    id: 14, 
    name: "Holy Light", 
    type: "support", 
    damage: -25, 
    range: 15, 
    castDuration: 2, 
    manaCost: 20, 
    cooldown: 6, 
    availability: true,
    damageType: 'holy',
    critChance: 0.20,
    critMultiplier: 2.0,
    statusEffects: [
      { type: 'blessing', target: 'self', duration: 10, damageReduction: 0.2 },
      { type: 'purify', target: 'self', duration: 1 }
    ],
    knockback: 0,
    areaOfEffect: true,
    phase: 3
  }
];



class Attack {
  constructor({id, name, type, damage, range, castDuration, manaCost, cooldown, availability, imageSrc, framesX=1, imgWidth=0, imgHeight=0}) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.damage = damage;
    this.range = range;
    this.castDuration = castDuration;
    this.manaCost = manaCost;
    this.cooldown = cooldown;
    this.availability = availability;
    this.isVisible=true
    // Position and movement
    this.targetX = null;
    this.targetY = null;
    this.x = player.x;
    this.y = player.y;
    this.acceleration = 10;
    this.vx = 0;
    this.vy = 0; // This was missing!
    
    // Size for drawing (you need to define these)
    this.width = imgWidth || 32;  // Default size if not specified
    this.height = imgHeight || 32;

    // Animation stuff
    this.image = new Image();
    this.imageLoaded = false;
    this.imageError = false;
    this.framesX = framesX;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;

    // Set up image loading handlers
    this.image.onload = () => {
      this.imageLoaded = true;
      console.log(`Attack image loaded: ${this.name}`);
    };

    this.image.onerror = (e) => {
      this.imageError = true;
      console.error(`Failed to load attack image for ${this.name}:`, imageSrc, e);
    };

    // Set source after handlers are set up
    if (imageSrc) {
      this.image.src = imageSrc;
      
    }

    // Animation state
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.frameHold = 5;
  }

  update(x, y) {
    this.targetX = x - (playerWidth) / 2 +block.width*1;
    this.targetY = y - (playerHeight) / 2 +block.height*0.7;
    

    if (this.targetX !== null && this.targetY !== null) {
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      let dist = Math.sqrt((dx * dx) + (dy * dy));

    let startDist = Math.sqrt(
    (this.x - player.x) * (this.x - player.x) + 
    (this.y - player.y) * (this.y - player.y)
    );

    if (isColliding(fireball, block)) {
  // Hit an obstacle - stop immediately
        this.isVisible = false;
        this.vx = 0;
        this.vy = 0;
        this.targetX = null;
        this.targetY = null;
        // console.log("Attack hit obstacle!");
        
    }else if (startDist > this.range) {
        // Beyond maximum range - stop attack
        this.isVisible = false;
        this.vx = 0;
        this.vy = 0;
        this.targetX = null;
        this.targetY = null;
        // console.log("Attack beyond range!");
        
    }else if (dist > 1) {
    // Still moving toward target - no collision, within range, and far enough away
        let dirX = dx / dist;
        let dirY = dy / dist;

        // Apply velocity (direct movement, not acceleration)
        this.vx = dirX * this.acceleration;
        this.vy = dirY * this.acceleration;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // console.log("Moving:", "dx:", dx, "dy:", dy, "dist:", dist, "range:", startDist);
    
    }else {
        // Reached target destination
        this.isVisible = false;
        this.vx = 0;
        this.vy = 0;
        this.x = this.targetX;
        this.y = this.targetY;
        this.targetX = null;
        this.targetY = null;
        console.log("Attack reached target!");
    }
    }

    // Update animation frames
    this.frameElapsed++;
    if (this.frameElapsed >= this.frameHold) {
      this.frameIndex++;
      this.frameElapsed = 0;

      if (this.frameIndex >= this.framesX) {
        this.frameIndex = 0; // loop animation
      }
    }
  }

  draw(ctx) { // Added ctx parameter
    // Try to draw sprite first if available

    
    // if (this.imageLoaded && !this.imageError && this.imgWidth > 0 && this.imgHeight > 0) {
    //   const frameWidth = this.imgWidth / this.framesX;
      
    //   try {
    //     ctx.drawImage(
    //       this.image,
    //       this.frameIndex * frameWidth, // source X
    //       0,                            // source Y
    //       frameWidth,                   // source width
    //       this.imgHeight,               // source height
    //       this.x,                       // destination X
    //       this.y,                       // destination Y
    //       frameWidth,                   // draw width
    //       this.imgHeight                // draw height
    //     );
    //     return; // Successfully drew sprite, exit
    //   } catch (error) {
    //     console.error(`Failed to draw sprite for ${this.name}:`, error);
    //   }
    // }
    ctx.clearRect(0,0,canvasAttacks.width,canvasAttacks.height)
    // // Fallback: draw grey rectangle
   if(this.isVisible){
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, 20, 20);
   }
    
  }
}
// Auto-convert whole library into Attack instances
const attacks = attackLibrary.map(data => new Attack(data));

// Example usage:
const fireball = attacks[0];  // Fireball


function applyAttackDamage(attack, target, attacker = player) {
    const isCritical = Math.random() < attack.critChance;

    let armor = 0;
    let armorType = 'physical';

    if (target.armor) {
    switch(attack.damageType) {
      case 'physical':
        armor = target.armor || 0;
        armorType = 'physical';
        break;
      case 'fire':
      case 'ice':
      case 'lightning':
      case 'arcane':
      case 'shadow':
        armor = target.magicResistance || 0;
        armorType = 'magical';
        break;
      case 'poison':
        armor = target.poisonResistance || 0;
        armorType = 'poison';
        break;
      default:
        armor = target.armor || 0;
    }
  }
  const damageResult = applyDamage(target, Math.abs(attack.damage), {
    damageType: attack.damageType,
    isCritical: isCritical,
    criticalMultiplier: attack.critMultiplier,
    armor: armor,
    armorType: armorType,
    penetration: attack.armorPenetration || 0,
    statusEffects: attack.statusEffects || [],
    knockback: attack.knockback || 0,
    showFloatingText: true,
    onDamageCallback: (target, info) => {
      // Custom callback for each attack type
      if (info.wasKilled) {
        console.log(`${target.name || 'Enemy'} was defeated by ${attack.name}!`);
        // Award experience, play death sound, etc.
      }
      
      // Special attack effects
      if (attack.name === "Thunderstorm" && attack.areaOfEffect) {
        // Apply chain lightning to nearby enemies
        console.log("Chain lightning effect triggered!");
      }
    }
  });

  return damageResult;
  

}


function applyDamage(target, damage, options = {}) {
    const {
    damageType = 'physical',        // 'physical', 'magical', 'fire', 'ice', etc.
    isCritical = false,             // Is this a critical hit?
    criticalMultiplier = 2.0,       // Critical hit damage multiplier
    armor = 0,                      // Target's armor/resistance
    armorType = 'physical',         // What type of armor ('physical', 'magical')
    penetration = 0,                // Armor penetration percentage (0-100)
    minDamage = 1,                  // Minimum damage that can be dealt
    showFloatingText = true,        // Show damage numbers
    knockback = 0,                  // Knockback force
    statusEffects = [],             // Array of status effects to apply
    onDamageCallback = null         // Callback function when damage is dealt
  } = options;

  if (!target || typeof target.health === 'undefined') {
    console.error('Invalid target - must have health property');
    return false;
  }

  if (damage < 0) {
    console.warn('Negative damage value, treating as healing');
    return applyHealing(target, Math.abs(damage));
  }
  let effectiveArmor = armor;
  if (damageType === armorType) {
    // Apply armor penetration
    effectiveArmor = armor * (1 - (penetration / 100));
  }

  // Apply armor reduction (simple formula: damage * (100 / (100 + armor)))
  let finalDamage = damage * (100 / (100 + effectiveArmor));

  // Apply critical hit
  if (isCritical) {
    finalDamage *= criticalMultiplier;
  }

  // Ensure minimum damage
  finalDamage = Math.max(finalDamage, minDamage);
  
  // Round to integer
  finalDamage = Math.floor(finalDamage);

  // Store damage info before applying
  const damageInfo = {
    originalDamage: damage,
    finalDamage: finalDamage,
    damageType: damageType,
    isCritical: isCritical,
    wasKilled: false
  };
  // Apply damage to target
  const oldHealth = target.health;
  target.health = Math.max(0, target.health - finalDamage);
  
  // Check if target was killed
  if (target.health === 0 && oldHealth > 0) {
    damageInfo.wasKilled = true;
    if (target.onDeath && typeof target.onDeath === 'function') {
      target.onDeath();
    }
  }

  // Apply knockback if specified
  if (knockback > 0 && target.x !== undefined && target.y !== undefined) {
    if (target.vx !== undefined) target.vx += knockback * 0.1;
    if (target.vy !== undefined) target.vy += knockback * 0.1;
  }
  // Apply status effects
  if (statusEffects.length > 0 && target.statusEffects) {
    statusEffects.forEach(effect => {
      applyStatusEffect(target, { ...effect })
    });
  }

  // Show floating damage text
  if (showFloatingText) {
    showDamageText(target, finalDamage, isCritical, damageType);
  }

  // Execute callback
  if (onDamageCallback && typeof onDamageCallback === 'function') {
    onDamageCallback(target, damageInfo);
  }

  // Log damage (optional)
  console.log(`${target.name || 'Target'} took ${finalDamage} ${damageType} damage${isCritical ? ' (CRITICAL!)' : ''}`);

  return damageInfo;

}

function applyHealing(target, healAmount, options = {}) {
  const { maxHealth = target.maxHealth || 100, showFloatingText = true } = options;
  
  if (!target || typeof target.health === 'undefined') {
    console.error('Invalid target for healing');
    return false;
  }

  const oldHealth = target.health;
  target.health = Math.min(maxHealth, target.health + healAmount);
  const actualHealing = target.health - oldHealth;

  if (showFloatingText && actualHealing > 0) {
    showDamageText(target, actualHealing, false, 'healing');
  }

  console.log(`${target.name || 'Target'} healed for ${actualHealing} HP`);
  return { healAmount: actualHealing };
}

/**
 * Show floating damage/healing text
 */
function showDamageText(target, amount, isCritical, type) {
  // This is a placeholder - implement based on your game's UI system
  const color = type === 'healing' ? 'green' : (isCritical ? 'red' : 'white');
  const size = isCritical ? '20px' : '16px';
  
  // Example floating text (you'll need to adapt this to your game)
  console.log(`[${color.toUpperCase()}] ${isCritical ? 'CRITICAL! ' : ''}${amount} ${type.toUpperCase()}`);
  
  // If you have a floating text system, call it here:
  // floatingText.create(target.x, target.y, amount, color, size);
}
const StatusEffectRegistry = {
  // 🔥 Burn (damage over time)
  burn: {
    onApply: (target, effect) => {
      console.log(`${target.name} is burning! 🔥`);
    },
    onTick: (target, effect) => {
      target.health = Math.max(0, target.health - (effect.damage || 1));
      console.log(`${target.name} takes ${effect.damage || 1} burn damage`);
    },
    onExpire: (target) => {
      console.log(`${target.name} stopped burning.`);
    }
  },

  // ❄️ Slow (reduces movement speed)
  slow: {
    onApply: (target, effect) => {
      target.speedModifier = effect.speedReduction || 0.5;
      console.log(`${target.name} is slowed by ${target.speedModifier * 100}% ❄️`);
    },
    onTick: () => {},
    onExpire: (target) => {
      target.speedModifier = 1.0;
      console.log(`${target.name} is no longer slowed.`);
    }
  },

  // ⚡ Stun (disables movement/actions)
  stun: {
    onApply: (target) => {
      target.canMove = false;
      target.canAttack = false;
      console.log(`${target.name} is stunned! ⚡`);
    },
    onTick: () => {},
    onExpire: (target) => {
      target.canMove = true;
      target.canAttack = true;
      console.log(`${target.name} recovered from stun.`);
    }
    
  },

  // ☠️ Poison (damage over time, weaker than burn but longer)
  poison: {
    onApply: (target, effect) => {
      console.log(`${target.name} is poisoned! ☠️`);
    },
    onTick: (target, effect) => {
      target.health = Math.max(0, target.health - (effect.damage || 2));
      console.log(`${target.name} suffers ${effect.damage || 2} poison damage`);
    },
    onExpire: (target) => {
      console.log(`${target.name} is no longer poisoned.`);
    }
  },

  // 🛡️ Shield (absorbs incoming damage)
  shield: {
    onApply: (target, effect) => {
      target.shield = (target.shield || 0) + (effect.absorption || 0);
      console.log(`${target.name} gains a shield of ${effect.absorption} HP 🛡️`);
    },
    onTick: () => {},
    onExpire: (target, effect) => {
      target.shield = Math.max(0, (target.shield || 0) - (effect.absorption || 0));
      console.log(`${target.name}'s shield expired.`);
    }
  },

  // 🌱 Regeneration (heals over time)
  regeneration: {
    onApply: (target) => {
      console.log(`${target.name} is regenerating health 🌱`);
    },
    onTick: (target, effect) => {
      target.health = Math.min(target.maxHealth, target.health + (effect.healing || 2));
      console.log(`${target.name} heals ${effect.healing || 2} HP from regeneration`);
    },
    onExpire: (target) => {
      console.log(`${target.name}'s regeneration ended.`);
    }
  },

  // 🔥 Fire Shield (absorbs + reflects damage)
  fire_shield: {
    onApply: (target, effect) => {
      target.shield = (target.shield || 0) + (effect.absorption || 0);
      target.reflectDamage = effect.reflection || 0;
      console.log(`${target.name} is protected by a fiery shield 🔥🛡️`);
    },
    onTick: () => {},
    onExpire: (target, effect) => {
      target.shield = Math.max(0, (target.shield || 0) - (effect.absorption || 0));
      target.reflectDamage = 0;
      console.log(`${target.name}'s fire shield faded.`);
    }
  },

  // 🔮 Mana Burn (drains mana over time)
  mana_burn: {
    onApply: (target, effect) => {
      console.log(`${target.name} is afflicted with mana burn 🔮`);
    },
    onTick: (target, effect) => {
      if (target.mana !== undefined) {
        target.mana = Math.max(0, target.mana - (effect.manaDrain || 1));
        console.log(`${target.name} loses ${effect.manaDrain || 1} mana from burn`);
      }
    },
    onExpire: (target) => {
      console.log(`${target.name}'s mana burn ended.`);
    }
  },

  // 🌊 Healing Over Time (HoT)
  healing_over_time: {
    onApply: (target) => {
      console.log(`${target.name} is blessed with healing over time 🌊`);
    },
    onTick: (target, effect) => {
      target.health = Math.min(target.maxHealth, target.health + (effect.healing || 1));
      console.log(`${target.name} heals ${effect.healing || 1} HP over time`);
    },
    onExpire: (target) => {
      console.log(`${target.name}'s healing effect faded.`);
    }
  },

  // 😱 Fear (forces target to flee / disables attacking)
  fear: {
    onApply: (target) => {
      target.canAttack = false;
      target.isFeared = true;
      console.log(`${target.name} is terrified and flees! 😱`);
    },
    onTick: (target) => {
      if (target.isFeared) {
        target.x += (Math.random() < 0.5 ? -1 : 1) * 5; // random movement
      }
    },
    onExpire: (target) => {
      target.canAttack = true;
      target.isFeared = false;
      console.log(`${target.name} is no longer afraid.`);
    }
  },

  // ⚡ Chain Lightning (jumps between targets)
  chain_lightning: {
    onApply: (target, effect) => {
      console.log(`${target.name} is struck by chain lightning ⚡`);
      // Here you’d implement logic to find nearby enemies and apply damage
    },
    onTick: () => {},
    onExpire: () => {}
  },

  // ⚡ Paralysis (reduces movement/attack)
  paralysis: {
    onApply: (target) => {
      target.canMove = false;
      console.log(`${target.name} is paralyzed ⚡`);
    },
    onTick: () => {},
    onExpire: (target) => {
      target.canMove = true;
      console.log(`${target.name} recovered from paralysis.`);
    }
  },

  // ✨ Blessing (buff: damage reduction)
  blessing: {
    onApply: (target, effect) => {
      target.damageReduction = effect.damageReduction || 0.2;
      console.log(`${target.name} is blessed ✨`);
    },
    onTick: () => {},
    onExpire: (target) => {
      target.damageReduction = 0;
      console.log(`${target.name}'s blessing ended.`);
    }
  },

  // 🕊️ Purify (removes debuffs)
  purify: {
    onApply: (target) => {
      if (target.statusEffects) {
        target.statusEffects = target.statusEffects.filter(e => 
          !['burn','poison','fear','stun','paralysis'].includes(e.type)
        );
      }
      console.log(`${target.name} is purified 🕊️ All debuffs removed`);
    },
    onTick: () => {},
    onExpire: () => {}
  },

  // 🌍 Knockdown (forces fall / disables movement briefly)
  knockdown: {
    onApply: (target) => {
      target.canMove = false;
      console.log(`${target.name} is knocked down 🌍`);
    },
    onTick: () => {},
    onExpire: (target) => {
      target.canMove = true;
      console.log(`${target.name} got back up.`);
    }
  }
};


function updateStatusEffects(target, deltaTimeSec) {
  if (!target.statusEffects || target.statusEffects.length === 0) return;

  const nowMs = Date.now();

  target.statusEffects = target.statusEffects.filter(effect => {
    const effectDef = StatusEffectRegistry[effect.type];
    if (!effectDef) return false; // unknown effect

    // Tick-based effects (tickInterval stored in SECONDS)
    if (effect.tickInterval) {
      const elapsed = (nowMs - effect.lastTick) / 1000; // convert to seconds
      if (elapsed >= effect.tickInterval) {
        if (typeof effectDef.onTick === "function") {
          effectDef.onTick(target, effect);
        }
        effect.lastTick = nowMs;
      }
    }

    // Decrease duration (already in seconds)
    effect.duration -= deltaTimeSec;
    
    if (effect.duration <= 0) {
      if (typeof effectDef.onExpire === "function") {
        effectDef.onExpire(target, effect);
      }
      return false; // remove expired
    }
    
    return true; // keep
  });
}
function applyStatusEffect(target, effectSpec) {
  if (!target.statusEffects) target.statusEffects = [];

  const effectDef = StatusEffectRegistry[effectSpec.type];
  if (!effectDef) {
    console.warn("Unknown effect:", effectSpec.type);
    return;
  }

  // Clone effect so you don’t mutate the source object
  const effect = {
    ...effectSpec,
    duration: effectSpec.duration, // seconds
    lastTick: Date.now()
  };

  if (typeof effectDef.onApply === "function") {
    effectDef.onApply(target, effect);
  }

  target.statusEffects.push(effect);
}


class BossNew {
  constructor(x, y) {
    // Basic properties
    this.name = "Boss";
    this.x = x;
    this.y = y;
    this.width = 120;
    this.height = 120;
    
    // Health and defense
    this.maxHealth = 500;
    this.health = this.maxHealth;
    this.armor = 20;
    this.magicResistance = 15;
    this.poisonResistance = 10;
    this.statusEffects = [];
    
    // Movement
    this.speed = 400;
    this.vx = 0;
    this.vy = 0;
    this.targetX = null;
    this.targetY = null;
    
    // Combat
    this.damage = 25;
    this.attackRange = 1000;
    this.detectionRange = 2000;
    this.lastAttackTime = 0;
    this.attackCooldown = 2000; // 2 seconds
    
    // AI States
    this.state = "idle"; // idle, chase, attack, dead
    this.aggroTarget = null;
    this.lastPlayerSeen = 0;
    this.memoryDuration = 10000; // Remember player for 5 seconds
    
    // Phase system
    this.currentPhase = 1;
    this.phaseTransitioning = false;
    
    // Visual
    this.facingLeft = false;
    this.color = "#8B0000";
    this.isInvulnerable = false;
    
    // Animation (if you want to add sprites later)
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.frameHold = 8;
    
    console.log(`${this.name} spawned with ${this.health}/${this.maxHealth} HP`);
  }
  
  update(deltaTime) {
    if (this.health <= 0 && this.state !== "dead") {
      this.die();
      return;
    }
   
    // Update status effects
    updateStatusEffects(this, deltaTime);
    
    // Check if stunned or unable to act
    if (!this.canAct()) {
      return;
    }
    
    // Update phase based on health
    this.updatePhase();
    
    // Update AI
    this.updateAI(deltaTime);
    
    // Update movement
    this.updateMovement(deltaTime);
  }
  
  canAct() {
    const disablingEffects = ['stun', 'fear', 'paralysis', 'knockdown'];
    return !this.statusEffects.some(effect => disablingEffects.includes(effect.type));
  }
  
  updatePhase() {
    const healthPercent = this.health / this.maxHealth;
    
    // Phase 2 at 66% health
    if (healthPercent <= 0.66 && this.currentPhase === 1) {
      this.transitionToPhase(2);
    }
    // Phase 3 at 33% health  
    else if (healthPercent <= 0.33 && this.currentPhase === 2) {
      this.transitionToPhase(3);
    }
  }
  
  transitionToPhase(phase) {
    this.currentPhase = phase;
    this.phaseTransitioning = true;
    
    console.log(`${this.name} enters Phase ${phase}!`);
    
    // Increase difficulty each phase
    if (phase === 2) {
      this.speed *= 1.2;
      this.attackCooldown *= 0.8;
      this.damage *= 1.2;
    } else if (phase === 3) {
      this.speed *= 1.3;
      this.attackCooldown *= 0.7;
      this.damage *= 1.3;
      this.color = "#FF0000"; // Turn red when enraged
    }
    
    // Brief invulnerability during transition
    this.makeInvulnerable(1000);
    
    setTimeout(() => {
      this.phaseTransitioning = false;
    }, 2000);
  }
  
  updateAI(deltaTime) {
    const distanceToPlayer = this.getDistanceToPlayer();
    const currentTime = Date.now();
    
    switch(this.state) {
      case "idle":
        // Check if player is in detection range
        if (distanceToPlayer < this.detectionRange) {
          this.aggroTarget = player;
          this.lastPlayerSeen = currentTime;
          this.changeState("chase");
        }
        break;
        
      case "chase":
        // Lose aggro if player is too far for too long
        if (distanceToPlayer > this.detectionRange * 1.5 && 
            currentTime - this.lastPlayerSeen > this.memoryDuration) {
          this.aggroTarget = null;
          this.changeState("idle");
          break;
        }
        
        // Update player position if in range
        if (distanceToPlayer < this.detectionRange) {
          this.lastPlayerSeen = currentTime;
        }
        
        // Move towards player
        this.targetX = player.x;
        this.targetY = player.y;
        
        // Switch to attack if in range and cooldown is ready
        if (distanceToPlayer < this.attackRange && 
            currentTime - this.lastAttackTime > this.attackCooldown) {
          this.changeState("attack");
        }
        break;
        
      case "attack":
        // Stop movement and attack
        this.vx = 0;
        this.vy = 0;
        
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
          this.performAttack();
          this.lastAttackTime = currentTime;
          
          // Return to chase after brief delay
          setTimeout(() => {
            if (this.state === "attack") {
              this.changeState("chase");
            }
          }, 500);
        }
        break;
    }
  }
  
  updateMovement(deltaTime) {
    if (this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        this.vx = dirX * this.speed;
        this.vy = dirY * this.speed;
        
        // Update facing direction
        this.facingLeft = dirX < 0;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }
    
    // Apply movement
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Keep boss within screen bounds
    this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
    this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));
  }
  
  performAttack() {
    const chosen = this.chooseAttack();
  if (!chosen) return;

  console.log(`${this.name} uses ${chosen.name}!`);

  applyDamage(player, chosen.damage, {
    damageType: chosen.damageType,
    statusEffects: chosen.statusEffects || [],
    knockback: chosen.knockback || 0,
    critChance: chosen.critChance || 0,
    critMultiplier: chosen.critMultiplier || 1.5,
    onDamageCallback: (target, info) => {
      console.log(`${this.name} hits ${target.name} with ${chosen.name} for ${info.finalDamage} damage!`);
    }
  });

  this.lastAttackTime = Date.now();
  }
chooseAttack() {
  const distanceToPlayer = this.getDistanceToPlayer();

  // Step 1: filter out invalid attacks
  let validAttacks = attackLibrary.filter(a => {
    // Phase restrictions
    if (this.currentPhase === 1 && a.phase && a.phase > 1) return false;
    if (this.currentPhase === 2 && a.phase && a.phase > 2) return false;

    // Never melee at long range
    if (a.type === "melee" && a.range < distanceToPlayer) return false;

    return true;
  });

  if (validAttacks.length === 0) return null;

  // Step 2: assign weights
  const weights = validAttacks.map(a => {
    if (a.type === "melee") {
      return distanceToPlayer < 200 ? 5 : 1; // strong bias close range
    } else if (a.range >= 600) {
      return distanceToPlayer > 400 ? 4 : 2; // nukes more likely far away
    } else {
      return 3; // balanced mid-range
    }
  });

  // Step 3: surprise chance (10%)
  if (Math.random() < 0.1) {
    return validAttacks[Math.floor(Math.random() * validAttacks.length)];
  }

  // Step 4: weighted pick
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < validAttacks.length; i++) {
    if (r < weights[i]) return validAttacks[i];
    r -= weights[i];
  }

  return validAttacks[0];
}
 
  takeDamage(damage, options = {}) {
    if (this.isInvulnerable) {
      console.log(`${this.name} is invulnerable!`);
      return false;
    }
    
    // Apply damage
    const result = applyDamage(this, damage, options);
    
    // Boss reactions to taking damage
    if (result.finalDamage > 0) {
      // Interrupt attack state
      if (this.state === "attack") {
        this.changeState("chase");
      }
      
      // 10% chance to do special reaction when damaged
      if (Math.random() < 0.1) {
        this.specialReaction();
      }
    }
    
    return result;
  }
  
  specialReaction() {
    const reactions = ['teleport', 'heal', 'rage'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    switch(reaction) {
      case 'teleport':
        this.teleport();
        break;
      case 'heal':
        const healAmount = Math.floor(this.maxHealth * 0.1); // Heal 10%
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        console.log(`${this.name} heals for ${healAmount} HP!`);
        break;
      case 'rage':
        this.damage *= 1.2;
        this.speed *= 1.2;
        console.log(`${this.name} enters a rage!`);
        setTimeout(() => {
          this.damage /= 1.2;
          this.speed /= 1.2;
        }, 5000);
        break;
    }
  }
  
  teleport() {
    // Teleport to random location away from player
    let newX, newY, distance;
    do {
      newX = Math.random() * (canvas.width - this.width) + this.width/2;
      newY = Math.random() * (canvas.height - this.height) + this.height/2;
      distance = Math.sqrt((newX - player.x)**2 + (newY - player.y)**2);
    } while (distance < 150); // Ensure minimum distance from player
    
    this.x = newX;
    this.y = newY;
    console.log(`${this.name} teleports!`);
  }
  
  makeInvulnerable(duration) {
    this.isInvulnerable = true;
    setTimeout(() => {
      this.isInvulnerable = false;
    }, duration);
  }
  
  getDistanceToPlayer() {
    return Math.sqrt((this.x - player.x)**2 + (this.y - player.y)**2);
  }
  
  changeState(newState) {
    if (this.state !== newState) {
      console.log(`${this.name}: ${this.state} -> ${newState}`);
      this.state = newState;
    }
  }
  
  die() {
    this.state = "dead";
    console.log(`${this.name} has been defeated!`);
    
    // Award experience or trigger victory condition
    console.log("Player wins!");
    
    // You can add victory logic here
    // gameState = "victory";
  }
  
  draw(ctx) {
    if (this.state === "dead") return;
    
    // Draw health bar
    this.drawHealthBar(ctx);
    
    // Draw status effects
    // drawStatusEffects(ctx, this, this.x - this.width/2, this.y - this.height/2);
    
    // Draw boss body
    ctx.fillStyle = this.isInvulnerable ? "#FF8888" : this.color;
    ctx.fillRect(
      this.x - this.width/2,
      this.y - this.height/2,
      this.width,
      this.height
    );
    
    // Draw name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.name, this.x, this.y);
    
    // Draw phase indicator
    ctx.fillStyle = "#FFFF00";
    ctx.font = "12px Arial";
    ctx.fillText(`Phase ${this.currentPhase}`, this.x, this.y + 20);
    
    // Phase transition effect
    if (this.phaseTransitioning) {
      ctx.strokeStyle = "#FFFF00";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.x - this.width/2 - 5,
        this.y - this.height/2 - 5,
        this.width + 10,
        this.height + 10
      );
    }
  }
  
  drawHealthBar(ctx) {
    const barWidth = this.width + 20;
    const barHeight = 8;
    const x = this.x - barWidth/2;
    const y = this.y - this.height/2 - 20;
    
    // Background
    ctx.fillStyle = "#444444";
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? "#00FF00" : 
                    healthPercent > 0.25 ? "#FFFF00" : "#FF0000";
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Health text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${this.health}/${this.maxHealth}`, this.x, y - 3);
  }
}

// Usage:
const boss = new BossNew(400, 300);
// 
// In game loop:

//
// When player attacks hit:
// boss.takeDamage(attack.damage, { damageType: 'fire', statusEffects: [...] });