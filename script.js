const canvasBackground = document.getElementById('canvas1');
const ctxB = canvasBackground.getContext('2d');
const canvasWidth1 = canvasBackground.width = 1400;
const canvasHeight1 = canvasBackground.height = 700;

let gameSpeed = 15;
let lastTime = performance.now();

let activeAttacks = [];

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
        this.speedModifier=1
        this.speed = 600 * this.speedModifier;
        this.speedY = 0;
        this.gravity = gravity;  // tweak this for jump feel
        this.jumpStrength = 800*this.speedModifier;
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
            this.x += (600 * this.speedModifier) * deltaTime;
            if (this.isOnGround) this.state = "run";
            this.facingLeft = false;
            this.facingRight=true
        } else if (keys.ArrowLeft || keys.a) {
            this.x -= (600 * this.speedModifier) * deltaTime;
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
           
          setTimeout(() => this.performAttack(), 500);
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

  // Create an Attack instance
  const attack = new Attack(chosen, this, player);

  // Decide how to resolve it
  const isProjectile = (chosen.type === "damageDealer" && (chosen.range ?? 0) > 1);

if (isProjectile) {
  // Projectile attack (handled by movement/collision system)
  activeAttacks.push(attack);

} else {
  // Split damage vs buffs/debuffs
  if (attack.type === "damageDealer") {
    const meleeRange = 50; // tweak to taste
    const dx = player.x - boss.x;
    const dy = Math.abs(player.y - boss.y);

    let inFront = false;

    if (boss.facing === "right" && dx > 0 && dx < meleeRange && dy < 30) {
      inFront = true;
    } else if (boss.facing === "left" && dx < 0 && Math.abs(dx) < meleeRange && dy < 30) {
      inFront = true;
    }

    if (inFront) {
      attack.applyEffects(player);
      console.log("✅ Boss melee hit landed!");
    } else {
      console.log("❌ Boss melee missed (player not in range).");
    }

  } else {
    // Buffs, debuffs, heals, status effects → always apply
    attack.applyEffects(player);
    console.log("✨ Buff/debuff applied regardless of range");
  }

  attack.destroy();
}


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

    boss.update(deltaTime);
    boss.draw(ctx);

        // Update and draw active attacks
    for (let i = activeAttacks.length - 1; i >= 0; i--) {
    const attack = activeAttacks[i];
    if (!attack.isVisible) {
        activeAttacks.splice(i, 1); // remove finished ones
    } else {
        attack.update();
        attack.draw(ctx);
    }
    }


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
    range: 5, 
    castDuration: 0, 
    manaCost: 0, 
    cooldown: 0, 
    availability: true, 
    // imageSrc:'background.jpg', 
    framesX:8, 
    imgWidth:576, 
    imgHeight:72,
    damageType: 'physical',
    critChance: 0.05,
    critMultiplier: 1.5,
    armorPenetration: 0,
    statusEffects: [],
    knockback: 2,
    phase: 2
  },
  { 
    id: 1, 
    name: "Fireball", 
    type: "damageDealer", 
    damage: 20, 
    range: 300, 
    castDuration: 1.5, 
    manaCost: 10, 
    cooldown: 3, 
    availability: true,
    imageSrc:'Resources/attack/Magic/fireball_0.png', 
    damageType: 'fire',
    critChance: 0.15,
    critMultiplier: 2.2,
    armorPenetration: 10,
    statusEffects: [{ type: 'burn', target: 'enemy', duration: 3, damage: 2 }],
    knockback: 5,
    phase: 1,
    imgWidth:512,
    imgHeight:512,
    framesX:8,
    framesY:8,
    framePicked:4,
    homing:false,
    homingDuration:50

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
    statusEffects: [{ type: 'slow', target: 'enemy', duration: 5, speedReduction: 0.1}],
    knockback: 3,
    phase: 2
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
    statusEffects: [{ type: 'stun', target: 'enemy', duration: 50 }],
    knockback: 8,
    phase: 2,
    
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
    phase: 2
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
    phase:2
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
    phase: 2
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
    phase: 2
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
    phase: 2
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
    phase: 2
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
    phase: 2
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
    phase: 2
  },
  { 
    id: 15, 
    name: "beam", 
    type: "damageDealer", 
    damage: 5, 
    range: 500, 
    castDuration: 5, 
    manaCost: 20, 
    cooldown: 30, 
    availability: true, 
    imageSrc:'Resources/attack/Magic/beam.png', 
    damageType: 'fire',
    critChance: 0.15,
    critMultiplier: 2.2,
    armorPenetration: 10,
    statusEffects: [{ type: 'burn', target: 'enemy', duration: 3, damage: 2 }],
    knockback: 5,
    phase: 2,
    imgWidth:576,
    imgHeight:72,
    framesX:8,
    framesY:1,
    framePicked:0,
    homing:false,
    homingDuration:null,
    length:500

  }
];


//error in attack class
class Attack {
  constructor(data, caster, target) {
    Object.assign(this, data); // copy all attackLibrary fields
    if (!caster) {
      return; // Exit early to avoid crashing
    }

    this.caster = caster;  // who launched it
    this.target = target;  // who it's aimed at

    this.isVisible = true;
    this.homing = this.homing ?? false; // Default to non-homing if not specified
    this.homingDuration=this.homingDuration

    // Projectile properties
    this.x = caster.x;
    this.y = caster.y;
    this.targetX = target ? target.x : null;
    this.targetY = target ? target.y : null;
    this.acceleration = 40;
    this.vx = 0;
    this.vy = 0;
    this.scale = 3
    // Calculate initial direction for non-homing projectiles
    if (target) {
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      
      // Set initial velocity for non-homing projectiles
      if (!this.homing && dist > 0) {
        this.vx = (dx / dist) * this.acceleration;
        this.vy = (dy / dist) * this.acceleration;
      }
    }

    // Angle in radians between caster and target
    this.rotation = Math.atan2(
      this.targetY - this.y,
      this.targetX - this.x
    );

    // Animation
    this.image = new Image();
    this.imageLoaded = false;
    this.imageError = false;
    this.framesX = this.framesX || 1;
    this.framesY = this.framesY || 1;
    this.imgWidth = this.imgWidth || 32;
    this.imgHeight = this.imgHeight || 32;
    this.framePicked = this.framePicked || 0;
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.frameHold = 5;

    if (this.imageSrc) {
      this.image.onload = () => (this.imageLoaded = true);
      this.image.onerror = () => (this.imageError = true);
      this.image.src = this.imageSrc;
    }
  }

  update() {
    if (!this.isVisible) return;

    // Range check
    let startDist = Math.sqrt(
      (this.x - this.caster.x) ** 2 + (this.y - this.caster.y) ** 2
    );
    if (startDist > this.range) {
      this.destroy();
      return;
    }

    // Collision check with target (if exists)
    if (this.target) {
      let dx = this.target.x - this.x;
      let dy = this.target.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) { // hitbox size
        this.applyEffects(this.target);
        this.destroy();
        return;
      }

      // Movement logic - different for homing vs non-homing
      if (this.homing && this.homingDuration>0) {
        // Homing projectiles: recalculate direction each frame
        if (dist > 1) {
          let dirX = dx / dist;
          let dirY = dy / dist;
          this.vx = dirX * this.acceleration;
          this.vy = dirY * this.acceleration;
          
          // Update rotation for homing projectiles
          this.rotation = Math.atan2(dy, dx);
          this.homingDuration--
        }
      }
      // Non-homing projectiles keep their initial velocity (set in constructor)
    }

    // Move the projectile
    this.x += this.vx;
    this.y += this.vy;

    // Animate
    this.frameElapsed++;
    if (this.frameElapsed >= this.frameHold) {
      this.frameIndex = (this.frameIndex + 1) % this.framesX;
      this.frameElapsed = 0;
    }
  }

  applyEffects(target) {
    // Crit handling
    let isCrit = Math.random() < (this.critChance || 0);
    let finalDamage = this.damage;
    if (isCrit) finalDamage *= this.critMultiplier || 1.5;

    if (this.damage > 0) {
      applyDamage(target, finalDamage, {
        damageType: this.damageType,
        knockback: this.knockback,
        crit: isCrit,
      });
    } else if (this.damage < 0) {
      applyHealing(this.caster, -finalDamage);
    }

    // Status effects
    if (this.statusEffects && this.statusEffects.length > 0) {
      this.statusEffects.forEach(effect => {
        if (effect.target === "enemy" && target.statusEffects) {
          applyStatusEffect(target, { ...effect });
        } else if (effect.target === "self" && this.caster.statusEffects) {
          applyStatusEffect(this.caster, { ...effect });
        }
      });
    }

    console.log(`${this.caster.name} hit ${target.name} with ${this.name}!`);
  }

  destroy() {
    this.isVisible = false;
    this.vx = this.vy = 0;
  }

  draw(ctx) {
    if (!this.isVisible) return;

    if (this.imageLoaded && !this.imageError) {
      const frameWidth = this.imgWidth / this.framesX;
      const frameHeight = this.imgHeight / this.framesY;

      const centerX = this.x + (frameWidth * this.scale) / 2;
      const centerY = this.y + (frameHeight * this.scale) / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.rotation);  // make it point toward target
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(
        this.image,
        this.frameIndex * frameWidth,
        this.framePicked * frameHeight,
        frameWidth,
        frameHeight,
        this.x,
        this.y,
        frameWidth * this.scale,
        frameHeight * this.scale
      );
      
      ctx.restore();
    } else {
      ctx.fillStyle = "green";
      ctx.fillRect(this.x, this.y, 20, 20);
    }
  }
}

// Auto-convert whole library into Attack instances

// Example usage:
// const fireball = attacks[0];  // Fireball


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
      console.log(`${target.speed} target new speed`);
      console.log(`${target.speedModifier} target new speedMODIEFIER`)
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



class Movement {
  constructor(entity, pattern, params = {}) {
    this.entity = entity;
    this.pattern = pattern;
    this.params = { ...this.getDefaultParams(pattern), ...params };
    
    // Common state variables
    this.isActive = true;
    this.timeElapsed = 0;
    this.phase = 0; // For multi-phase movements
    this.phaseTimer = 0;
    this.initialX = entity.x;
    this.initialY = entity.y;
    this.targetX = null;
    this.targetY = null;
    this.originalSpeed = entity.speed || 2;
    
    // Pattern-specific initialization
    this.initializePattern();
  }

  getDefaultParams(pattern) {
    const defaults = {
      // Basic Movement
      straightChase: { speed: 3, acceleration: 0.1 },
      strafe: { radius: 100, speed: 2, clockwise: true },
      dashForward: { dashSpeed: 8, dashDuration: 30, cooldown: 60 },
      backstep: { stepDistance: 50, stepSpeed: 6, duration: 20 },
      zigzagRush: { amplitude: 30, frequency: 0.1, baseSpeed: 2 },
      sideDash: { dashDistance: 80, dashSpeed: 7, direction: 1 },

      // Aggressive
      orbitLunge: { orbitRadius: 120, orbitSpeed: 2, lungeSpeed: 10, orbitTime: 120 },
      teleportStrike: { teleportRange: 80, strikePause: 15, fadeTime: 10 },
      fakeOutDash: { fakeDistance: 60, fakeSpeed: 5, realSpeed: 8, pauseTime: 20 },
      chargeThrough: { chargeSpeed: 12, chargeDuration: 60, windup: 30 },
      jumpSlam: { jumpHeight: 100, jumpDuration: 45, slamSpeed: 15 },
      multiDashCombo: { dashCount: 3, dashSpeed: 9, dashDistance: 70, pauseBetween: 15 },

      // Defensive
      mirageCloneDash: { cloneCount: 3, dashSpeed: 6, cloneDuration: 40 },
      warpBackwards: { warpDistance: 100, triggerHealth: 0.5 },
      evadeChain: { evadeCount: 4, evadeDistance: 40, evadeSpeed: 8, chainDelay: 8 },
      wallRun: { wallDistance: 150, runSpeed: 4, jumpOffSpeed: 7 },

      // Unnatural
      hoverGlide: { hoverHeight: 50, glideSpeed: 1.5, floatAmplitude: 10 },
      spiralDash: { spiralRadius: 80, spiralSpeed: 3, spiralTightening: 0.98 },
      erraticBlink: { blinkCount: 5, blinkRange: 60, settleTime: 30 },
      shadowCrawl: { crawlSpeed: 4, undergroundTime: 45, emergeDistance: 30 },
      gravityFlip: { flipDuration: 60, floatHeight: 120, crashSpeed: 12 },
      orbitRain: { orbitRadius: 200, orbitHeight: 150, dropSpeed: 10 },

      // Psychological
      tauntStagger: { staggerTime: 40, rushDelay: 20, rushSpeed: 8 },
      delayedDash: { windupTime: 30, pauseTime: 15, dashSpeed: 10 },
      trackingFakeOut: { trackingTime: 45, redirectAngle: 90, finalSpeed: 7 }
    };
    
    return defaults[pattern] || {};
  }

  initializePattern() {
    const player = this.getPlayer(); // Assume this exists
    
    switch(this.pattern) {
      case 'strafe':
        this.angle = Math.atan2(this.entity.y - player.y, this.entity.x - player.x);
        break;
      case 'orbitLunge':
        this.angle = 0;
        this.isOrbiting = true;
        break;
      case 'teleportStrike':
        this.isTeleporting = false;
        this.strikeTarget = { x: player.x, y: player.y };
        break;
      case 'spiralDash':
        this.currentRadius = this.params.spiralRadius;
        this.angle = 0;
        break;
      case 'multiDashCombo':
        this.currentDash = 0;
        this.dashDirection = Math.random() * Math.PI * 2;
        break;
      case 'evadeChain':
        this.currentEvade = 0;
        break;
    }
  }

  update() {
    if (!this.isActive) return;
    
    this.timeElapsed++;
    this.phaseTimer++;
    
    const player = this.getPlayer();
    if (!player) return;

    switch(this.pattern) {
      case 'straightChase':
        this.updateStraightChase(player);
        break;
      case 'strafe':
        this.updateStrafe(player);
        break;
      case 'dashForward':
        this.updateDashForward(player);
        break;
      case 'backstep':
        this.updateBackstep(player);
        break;
      case 'zigzagRush':
        this.updateZigzagRush(player);
        break;
      case 'sideDash':
        this.updateSideDash(player);
        break;
      case 'orbitLunge':
        this.updateOrbitLunge(player);
        break;
      case 'teleportStrike':
        this.updateTeleportStrike(player);
        break;
      case 'fakeOutDash':
        this.updateFakeOutDash(player);
        break;
      case 'chargeThrough':
        this.updateChargeThrough(player);
        break;
      case 'jumpSlam':
        this.updateJumpSlam(player);
        break;
      case 'multiDashCombo':
        this.updateMultiDashCombo(player);
        break;
      case 'mirageCloneDash':
        this.updateMirageCloneDash(player);
        break;
      case 'warpBackwards':
        this.updateWarpBackwards(player);
        break;
      case 'evadeChain':
        this.updateEvadeChain(player);
        break;
      case 'hoverGlide':
        this.updateHoverGlide(player);
        break;
      case 'spiralDash':
        this.updateSpiralDash(player);
        break;
      case 'erraticBlink':
        this.updateErraticBlink(player);
        break;
      case 'shadowCrawl':
        this.updateShadowCrawl(player);
        break;
      case 'gravityFlip':
        this.updateGravityFlip(player);
        break;
      case 'tauntStagger':
        this.updateTauntStagger(player);
        break;
      case 'delayedDash':
        this.updateDelayedDash(player);
        break;
      case 'trackingFakeOut':
        this.updateTrackingFakeOut(player);
        break;
    }
  }

  // Basic Movement Patterns
  updateStraightChase(player) {
    const dx = player.x - this.entity.x;
    const dy = player.y - this.entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 1) {
      const moveX = (dx / dist) * this.params.speed;
      const moveY = (dy / dist) * this.params.speed;
      this.entity.x += moveX;
      this.entity.y += moveY;
    }
  }

  updateStrafe(player) {
    const centerX = player.x;
    const centerY = player.y;
    
    this.angle += (this.params.clockwise ? 1 : -1) * this.params.speed * 0.05;
    
    this.entity.x = centerX + Math.cos(this.angle) * this.params.radius;
    this.entity.y = centerY + Math.sin(this.angle) * this.params.radius;
  }

  updateDashForward(player) {
    if (this.phase === 0) { // Dash phase
      if (this.phaseTimer === 1) {
        const dx = player.x - this.entity.x;
        const dy = player.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.dashVx = (dx / dist) * this.params.dashSpeed;
        this.dashVy = (dy / dist) * this.params.dashSpeed;
      }
      
      this.entity.x += this.dashVx;
      this.entity.y += this.dashVy;
      
      if (this.phaseTimer >= this.params.dashDuration) {
        this.phase = 1;
        this.phaseTimer = 0;
      }
    } else { // Cooldown phase
      if (this.phaseTimer >= this.params.cooldown) {
        this.phase = 0;
        this.phaseTimer = 0;
      }
    }
  }

  updateBackstep(player) {
    if (this.phaseTimer <= this.params.duration) {
      const dx = player.x - this.entity.x;
      const dy = player.y - this.entity.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 0) {
        // Move away from player
        const moveX = -(dx / dist) * this.params.stepSpeed;
        const moveY = -(dy / dist) * this.params.stepSpeed;
        this.entity.x += moveX;
        this.entity.y += moveY;
      }
    } else {
      this.isActive = false;
    }
  }

  updateZigzagRush(player) {
    const dx = player.x - this.entity.x;
    const dy = player.y - this.entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 1) {
      const baseX = (dx / dist) * this.params.baseSpeed;
      const baseY = (dy / dist) * this.params.baseSpeed;
      
      // Add zigzag offset
      const zigzagOffset = Math.sin(this.timeElapsed * this.params.frequency) * this.params.amplitude;
      const perpX = -baseY;
      const perpY = baseX;
      const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
      
      if (perpLength > 0) {
        this.entity.x += baseX + (perpX / perpLength) * zigzagOffset * 0.1;
        this.entity.y += baseY + (perpY / perpLength) * zigzagOffset * 0.1;
      }
    }
  }

  updateSideDash(player) {
    if (this.phaseTimer === 1) {
      const dx = player.x - this.entity.x;
      const dy = player.y - this.entity.y;
      
      // Calculate perpendicular direction
      const perpX = -dy * this.params.direction;
      const perpY = dx * this.params.direction;
      const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
      
      if (perpLength > 0) {
        this.dashVx = (perpX / perpLength) * this.params.dashSpeed;
        this.dashVy = (perpY / perpLength) * this.params.dashSpeed;
      }
    }
    
    if (this.phaseTimer <= 20) {
      this.entity.x += this.dashVx;
      this.entity.y += this.dashVy;
    } else {
      this.isActive = false;
    }
  }

  // Aggressive Patterns
  updateOrbitLunge(player) {
    if (this.isOrbiting && this.timeElapsed < this.params.orbitTime) {
      this.angle += this.params.orbitSpeed * 0.05;
      this.entity.x = player.x + Math.cos(this.angle) * this.params.orbitRadius;
      this.entity.y = player.y + Math.sin(this.angle) * this.params.orbitRadius;
    } else {
      // Lunge phase
      if (this.isOrbiting) {
        this.isOrbiting = false;
        const dx = player.x - this.entity.x;
        const dy = player.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.lungeVx = (dx / dist) * this.params.lungeSpeed;
        this.lungeVy = (dy / dist) * this.params.lungeSpeed;
      }
      
      this.entity.x += this.lungeVx;
      this.entity.y += this.lungeVy;
    }
  }

  updateTeleportStrike(player) {
    if (this.phase === 0 && this.phaseTimer >= this.params.fadeTime) {
      // Teleport near player
      const angle = Math.random() * Math.PI * 2;
      this.entity.x = player.x + Math.cos(angle) * this.params.teleportRange;
      this.entity.y = player.y + Math.sin(angle) * this.params.teleportRange;
      this.entity.alpha = 0; // Make invisible during teleport
      this.phase = 1;
      this.phaseTimer = 0;
    } else if (this.phase === 1) {
      // Fade back in and prepare strike
      this.entity.alpha = Math.min(1, this.phaseTimer / this.params.fadeTime);
      if (this.phaseTimer >= this.params.strikePause) {
        this.isActive = false;
      }
    }
  }

  // Add more update methods for remaining patterns...
  
  getPlayer() {
    // This should return the player object from your game
    // Implementation depends on your game structure
    return window.player || null;
  }

  stop() {
    this.isActive = false;
  }

  restart() {
    this.isActive = true;
    this.timeElapsed = 0;
    this.phase = 0;
    this.phaseTimer = 0;
    this.initializePattern();
  }
}
class MovementCombo {
  constructor(entity, comboName, customParams = {}) {
    this.entity = entity;
    this.comboName = comboName;
    this.customParams = customParams;
    
    // Combo state
    this.currentMoveIndex = 0;
    this.currentMovement = null;
    this.isActive = true;
    this.isPaused = false;
    this.comboComplete = false;
    
    // Transition settings
    this.transitionDelay = 0;
    this.transitionTimer = 0;
    
    // Get the combo sequence
    this.moves = this.getComboSequence(comboName);
    
    // Start first movement
    this.startNextMovement();
  }

  getComboSequence(comboName) {
    const combos = {
      // Short Combos (2-3 moves)
      'zigzagLunge': [
        { pattern: 'zigzagRush', params: { amplitude: 40, frequency: 0.12, baseSpeed: 2.5 }, duration: 60 },
        { pattern: 'dashForward', params: { dashSpeed: 10, dashDuration: 25 }, duration: 40, delay: 5 }
      ],
      
      'backstepTeleport': [
        { pattern: 'backstep', params: { stepDistance: 60, stepSpeed: 7 }, duration: 30 },
        { pattern: 'teleportStrike', params: { teleportRange: 70, strikePause: 20 }, duration: 50, delay: 10 }
      ],
      
      'orbitDash': [
        { pattern: 'strafe', params: { radius: 120, speed: 2.5, clockwise: true }, duration: 80 },
        { pattern: 'dashForward', params: { dashSpeed: 12, dashDuration: 30 }, duration: 45, delay: 8 }
      ],
      
      'sideDashSlam': [
        { pattern: 'sideDash', params: { dashDistance: 90, dashSpeed: 8, direction: 1 }, duration: 25 },
        { pattern: 'jumpSlam', params: { jumpHeight: 120, jumpDuration: 50, slamSpeed: 18 }, duration: 70, delay: 5 }
      ],
      
      'fakeOutCharge': [
        { pattern: 'fakeOutDash', params: { fakeDistance: 70, fakeSpeed: 6, pauseTime: 25 }, duration: 60 },
        { pattern: 'chargeThrough', params: { chargeSpeed: 15, chargeDuration: 80, windup: 20 }, duration: 100, delay: 3 }
      ],
      
      'strafeDelayed': [
        { pattern: 'strafe', params: { radius: 100, speed: 2, clockwise: false }, duration: 70 },
        { pattern: 'delayedDash', params: { windupTime: 40, pauseTime: 20, dashSpeed: 11 }, duration: 80, delay: 5 }
      ],
      
      'evadeLunge': [
        { pattern: 'evadeChain', params: { evadeCount: 3, evadeDistance: 50, evadeSpeed: 9 }, duration: 45 },
        { pattern: 'dashForward', params: { dashSpeed: 13, dashDuration: 20 }, duration: 35, delay: 8 }
      ],
      
      'teleportMirage': [
        { pattern: 'teleportStrike', params: { teleportRange: 80, strikePause: 15 }, duration: 40 },
        { pattern: 'mirageCloneDash', params: { cloneCount: 4, dashSpeed: 7, cloneDuration: 50 }, duration: 60, delay: 5 }
      ],

      // Mid Combos (3-4 moves)
      'orbitZigzagSlam': [
        { pattern: 'strafe', params: { radius: 140, speed: 2.2, clockwise: true }, duration: 60 },
        { pattern: 'zigzagRush', params: { amplitude: 35, frequency: 0.15, baseSpeed: 3 }, duration: 50, delay: 10 },
        { pattern: 'jumpSlam', params: { jumpHeight: 150, jumpDuration: 55, slamSpeed: 20 }, duration: 75, delay: 8 }
      ],
      
      'backstepTrackingDash': [
        { pattern: 'backstep', params: { stepDistance: 70, stepSpeed: 8 }, duration: 35 },
        { pattern: 'trackingFakeOut', params: { trackingTime: 50, redirectAngle: 120, finalSpeed: 8 }, duration: 70, delay: 12 },
        { pattern: 'dashForward', params: { dashSpeed: 14, dashDuration: 25 }, duration: 40, delay: 5 }
      ],
      
      'erraticSpiralSide': [
        { pattern: 'erraticBlink', params: { blinkCount: 4, blinkRange: 70, settleTime: 25 }, duration: 60 },
        { pattern: 'spiralDash', params: { spiralRadius: 90, spiralSpeed: 3.5, spiralTightening: 0.96 }, duration: 65, delay: 8 },
        { pattern: 'sideDash', params: { dashDistance: 100, dashSpeed: 10, direction: -1 }, duration: 30, delay: 5 }
      ],
      
      'hoverFakeoutLunge': [
        { pattern: 'hoverGlide', params: { hoverHeight: 60, glideSpeed: 1.8, floatAmplitude: 15 }, duration: 80 },
        { pattern: 'fakeOutDash', params: { fakeDistance: 80, fakeSpeed: 7, pauseTime: 30 }, duration: 70, delay: 10 },
        { pattern: 'dashForward', params: { dashSpeed: 15, dashDuration: 20 }, duration: 35, delay: 5 }
      ],
      
      'tauntDelayedTeleport': [
        { pattern: 'tauntStagger', params: { staggerTime: 50, rushDelay: 25, rushSpeed: 9 }, duration: 75 },
        { pattern: 'delayedDash', params: { windupTime: 35, pauseTime: 18, dashSpeed: 12 }, duration: 70, delay: 8 },
        { pattern: 'teleportStrike', params: { teleportRange: 60, strikePause: 12 }, duration: 45, delay: 5 }
      ],
      
      'shadowBackstabCharge': [
        { pattern: 'shadowCrawl', params: { crawlSpeed: 5, undergroundTime: 50, emergeDistance: 40 }, duration: 70 },
        { pattern: 'backstep', params: { stepDistance: 30, stepSpeed: 12 }, duration: 15, delay: 5 },
        { pattern: 'chargeThrough', params: { chargeSpeed: 18, chargeDuration: 60, windup: 15 }, duration: 85, delay: 8 }
      ],

      // Long Combos (4+ moves)
      'orbitRainSlamEvadeLunge': [
        { pattern: 'orbitRain', params: { orbitRadius: 220, orbitHeight: 180, dropSpeed: 12 }, duration: 90 },
        { pattern: 'jumpSlam', params: { jumpHeight: 140, jumpDuration: 60, slamSpeed: 22 }, duration: 80, delay: 10 },
        { pattern: 'evadeChain', params: { evadeCount: 4, evadeDistance: 45, evadeSpeed: 10 }, duration: 50, delay: 12 },
        { pattern: 'dashForward', params: { dashSpeed: 16, dashDuration: 25 }, duration: 40, delay: 8 }
      ],
      
      'wallRunBackstepFakeSpiral': [
        { pattern: 'wallRun', params: { wallDistance: 160, runSpeed: 5, jumpOffSpeed: 8 }, duration: 70 },
        { pattern: 'backstep', params: { stepDistance: 80, stepSpeed: 9 }, duration: 40, delay: 8 },
        { pattern: 'fakeOutDash', params: { fakeDistance: 90, fakeSpeed: 8, pauseTime: 35 }, duration: 80, delay: 10 },
        { pattern: 'spiralDash', params: { spiralRadius: 100, spiralSpeed: 4, spiralTightening: 0.94 }, duration: 75, delay: 5 }
      ],
      
      'hoverErraticOrbitTeleport': [
        { pattern: 'hoverGlide', params: { hoverHeight: 80, glideSpeed: 2, floatAmplitude: 20 }, duration: 100 },
        { pattern: 'erraticBlink', params: { blinkCount: 5, blinkRange: 80, settleTime: 30 }, duration: 75, delay: 12 },
        { pattern: 'strafe', params: { radius: 130, speed: 3, clockwise: false }, duration: 85, delay: 8 },
        { pattern: 'teleportStrike', params: { teleportRange: 90, strikePause: 18 }, duration: 50, delay: 10 }
      ],
      
      'zigzagSideTauntDelaySlam': [
        { pattern: 'zigzagRush', params: { amplitude: 45, frequency: 0.18, baseSpeed: 2.8 }, duration: 65 },
        { pattern: 'sideDash', params: { dashDistance: 110, dashSpeed: 11, direction: 1 }, duration: 30, delay: 8 },
        { pattern: 'tauntStagger', params: { staggerTime: 60, rushDelay: 30, rushSpeed: 10 }, duration: 90, delay: 15 },
        { pattern: 'delayedDash', params: { windupTime: 45, pauseTime: 25, dashSpeed: 13 }, duration: 85, delay: 10 },
        { pattern: 'jumpSlam', params: { jumpHeight: 160, jumpDuration: 65, slamSpeed: 25 }, duration: 90, delay: 5 }
      ],
      
      'shadowMirageEvadeCharge': [
        { pattern: 'shadowCrawl', params: { crawlSpeed: 6, undergroundTime: 55, emergeDistance: 50 }, duration: 80 },
        { pattern: 'mirageCloneDash', params: { cloneCount: 5, dashSpeed: 8, cloneDuration: 60 }, duration: 75, delay: 10 },
        { pattern: 'evadeChain', params: { evadeCount: 5, evadeDistance: 55, evadeSpeed: 11 }, duration: 60, delay: 8 },
        { pattern: 'chargeThrough', params: { chargeSpeed: 20, chargeDuration: 70, windup: 25 }, duration: 95, delay: 12 }
      ],
      
      'trackingOrbitLungeGravitySlam': [
        { pattern: 'trackingFakeOut', params: { trackingTime: 55, redirectAngle: 135, finalSpeed: 9 }, duration: 80 },
        { pattern: 'strafe', params: { radius: 150, speed: 2.8, clockwise: true }, duration: 90, delay: 10 },
        { pattern: 'dashForward', params: { dashSpeed: 17, dashDuration: 22 }, duration: 35, delay: 8 },
        { pattern: 'gravityFlip', params: { flipDuration: 70, floatHeight: 140, crashSpeed: 15 }, duration: 90, delay: 15 },
        { pattern: 'jumpSlam', params: { jumpHeight: 200, jumpDuration: 75, slamSpeed: 30 }, duration: 100, delay: 5 }
      ]
    };

    return combos[comboName] || [];
  }

  update() {
    if (!this.isActive || this.isPaused || this.comboComplete) return;

    // Handle transition delay
    if (this.transitionTimer > 0) {
      this.transitionTimer--;
      return;
    }

    // Update current movement
    if (this.currentMovement) {
      this.currentMovement.update();
      
      // Check if current movement should end
      const currentMove = this.moves[this.currentMoveIndex];
      if (this.currentMovement.timeElapsed >= (currentMove.duration || 60)) {
        this.finishCurrentMovement();
      }
    }
  }

  finishCurrentMovement() {
    if (this.currentMovement) {
      this.currentMovement.stop();
    }
    
    this.currentMoveIndex++;
    
    // Check if combo is complete
    if (this.currentMoveIndex >= this.moves.length) {
      this.comboComplete = true;
      this.isActive = false;
      return;
    }
    
    // Set transition delay for next movement
    const nextMove = this.moves[this.currentMoveIndex];
    this.transitionDelay = nextMove.delay || 0;
    this.transitionTimer = this.transitionDelay;
    
    // Start next movement if no delay
    if (this.transitionDelay === 0) {
      this.startNextMovement();
    } else {
      // Schedule next movement
      setTimeout(() => this.startNextMovement(), this.transitionDelay * 16.67); // ~60fps timing
    }
  }

  startNextMovement() {
    if (this.currentMoveIndex >= this.moves.length) return;
    
    const move = this.moves[this.currentMoveIndex];
    const mergedParams = { ...move.params, ...this.customParams[move.pattern] || {} };
    
    this.currentMovement = new Movement(this.entity, move.pattern, mergedParams);
  }

  // Control methods
  pause() {
    this.isPaused = true;
    if (this.currentMovement) {
      this.currentMovement.isActive = false;
    }
  }

  resume() {
    this.isPaused = false;
    if (this.currentMovement) {
      this.currentMovement.isActive = true;
    }
  }

  stop() {
    this.isActive = false;
    if (this.currentMovement) {
      this.currentMovement.stop();
    }
  }

  restart() {
    this.currentMoveIndex = 0;
    this.currentMovement = null;
    this.isActive = true;
    this.isPaused = false;
    this.comboComplete = false;
    this.transitionTimer = 0;
    this.skippedMoves = []; // Reset skipped moves tracking
    this.startNextMovement();
  }

  // Get current combo progress
  getProgress() {
    const totalMoves = this.moves.length;
    const skippedCount = this.skippedMoves.length;
    const executedMoves = this.currentMoveIndex + 1 - skippedCount;
    
    return {
      currentMove: this.currentMoveIndex + 1,
      totalMoves: totalMoves,
      executedMoves: executedMoves,
      skippedMoves: skippedCount,
      currentPattern: this.moves[this.currentMoveIndex]?.pattern || null,
      percentage: ((this.currentMoveIndex + 1) / totalMoves) * 100,
      isComplete: this.comboComplete,
      skipHistory: [...this.skippedMoves] // Copy of skipped moves
    };
  }

  // Get skip statistics
  getSkipStats() {
    return {
      totalSkips: this.skippedMoves.length,
      skipRate: this.skippedMoves.length / this.moves.length,
      skippedPatterns: this.skippedMoves.map(skip => skip.pattern),
      currentSkipChance: this.skipChance
    };
  }

  // Adjust skip probability during gameplay
  setSkipChance(newChance) {
    this.skipChance = Math.max(0, Math.min(1, newChance)); // Clamp between 0-1
  }

  // Interrupt combo and switch to new one
  switchToCombo(newComboName, customParams = {}) {
    this.stop();
    this.comboName = newComboName;
    this.customParams = customParams;
    this.moves = this.getComboSequence(newComboName);
    this.restart();
  }
}