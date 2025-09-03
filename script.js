const canvasBackground = document.getElementById('canvas1');
const ctxB = canvasBackground.getContext('2d');
const canvasWidth1 = canvasBackground.width = 1400;
const canvasHeight1 = canvasBackground.height = 700;

let gameSpeed = 15;

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
const gravity=0.8
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
        this.speed = 15;
        this.speedY = 0;
        this.gravity = gravity;  // tweak this for jump feel
        this.jumpStrength = 15;
        this.isOnGround = false;
        this.groundY = canvas.height - playerHeight * this.scale*1.3;
        this.facingLeft=false;
        this.facingRight=true;
        this.targetX=null;
        this.targetY=null;
        this.acceleration=30;
        this.maxSpeed = 25;
        this.vx=0;
        this.vy=0;
       


    }

    update() {
        
        // Horizontal movement
        if (keys.ArrowRight || keys.d) {
            this.x += this.speed;
            if (this.isOnGround) this.state = "run";
            this.facingLeft = false;
            this.facingRight=true
        } else if (keys.ArrowLeft || keys.a) {
            this.x -= this.speed;
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
            this.gravity = 10;
            this.speedY += this.gravity;
            this.y += this.speedY;
        } else {
            this.gravity = gravity;
            this.speedY += this.gravity;
            this.y += this.speedY;
        }
        
       
       
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
                this.vx += dirX * this.acceleration;  
                this.vy += dirY * this.acceleration;  

                // Update position
                this.x += this.vx;
                this.y += this.vy;
                 

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

        if(keys.t){
           this.attack()
            
        }

        // Prevent going off screen horizontally
        this.x = Math.max(0, Math.min(canvas.width - playerWidth * this.scale, this.x));
        // Prevent going above top of canvas
        this.y = Math.max(0, this.y);
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

function animate() {
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
     
    
//    targetCharacter(block, player);

    player.update();
    player.draw();
   
    playerHealth.update();
    playerHealth.draw();

    playerStamina.update();
    playerStamina.draw()

    playerMana.update();
    playerMana.draw()

    fireball.update(block.x,block.y);
    fireball.draw(ctx)
   
    block.update();
    block.draw()

    resolveCollision(player, block);


    gameFrames++;
    
    
    
    ctx.restore()
    requestAnimationFrame(animate);
    
}

playerImage.onload = () => {
    animate();
};








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
        ctxStats.fillStyle = 'grey';
        ctxStats.fillRect(this.x, this.y, this.width, this.height);
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
canvas.width = 1400;
canvas.height = 700;

const attackLibrary = [
    { id: 0, name: "Melee", type: "damageDealer", damage: 5, range: 500, castDuration: 0, manaCost: 0, cooldown: 0, availability: true, imageSrc:'background.jpg', framesX:8, imgWidth:576, imgHeight:72 },
    { id: 1, name: "Fireball", type: "damageDealer", damage: 20, range: 15, castDuration: 1.5, manaCost: 10, cooldown: 3, availability: true },
    { id: 2, name: "Ice Spike", type: "damageDealer", damage: 15, range: 12, castDuration: 1, manaCost: 8, cooldown: 2.5, availability: true },
    { id: 3, name: "Lightning Bolt", type: "damageDealer", damage: 25, range: 20, castDuration: 2, manaCost: 15, cooldown: 4, availability: true },
    { id: 4, name: "Heal", type: "support", damage: -20, range: 10, castDuration: 1.5, manaCost: 12, cooldown: 5, availability: true },
    { id: 5, name: "Shield", type: "defense", damage: 0, range: 0, castDuration: 0.5, manaCost: 5, cooldown: 3, availability: true },
    { id: 6, name: "Poison Dart", type: "damageDealer", damage: 12, range: 10, castDuration: 1, manaCost: 6, cooldown: 2, availability: true },
    { id: 7, name: "Earthquake", type: "damageDealer", damage: 30, range: 8, castDuration: 3, manaCost: 20, cooldown: 6, availability: true },
    { id: 8, name: "Wind Slash", type: "damageDealer", damage: 18, range: 14, castDuration: 1, manaCost: 8, cooldown: 2, availability: true },
    { id: 9, name: "Fire Shield", type: "defense", damage: 0, range: 0, castDuration: 0.5, manaCost: 10, cooldown: 4, availability: true },
    { id: 10, name: "Arcane Blast", type: "damageDealer", damage: 22, range: 16, castDuration: 1.2, manaCost: 12, cooldown: 3.5, availability: true },
    { id: 11, name: "Healing Wave", type: "support", damage: -15, range: 12, castDuration: 1.8, manaCost: 10, cooldown: 4, availability: true },
    { id: 12, name: "Shadow Strike", type: "damageDealer", damage: 28, range: 10, castDuration: 1.5, manaCost: 18, cooldown: 5, availability: true },
    { id: 13, name: "Thunderstorm", type: "damageDealer", damage: 35, range: 20, castDuration: 2.5, manaCost: 25, cooldown: 7, availability: true },
    { id: 14, name: "Holy Light", type: "support", damage: -25, range: 15, castDuration: 2, manaCost: 20, cooldown: 6, availability: true }
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
    
    // Position and movement
    this.targetX = null;
    this.targetY = null;
    this.x = player.x;
    this.y = player.y;
    this.acceleration = 1;
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
    this.targetX = x - (playerWidth) / 2;
    this.targetY = y - (playerHeight) / 2;
    

    if (this.targetX !== null && this.targetY !== null) {
      let dx = this.targetX - this.x;
      let dy = this.targetY - this.y;
      let dist = Math.sqrt((dx * dx) + (dy * dy));

      if (dist > 1) { // still far from destination
        let dirX = dx / dist;
        let dirY = dy / dist;

        // Apply acceleration
        this.vx += dirX * this.acceleration;
        this.vy += dirY * this.acceleration;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // console.log("Moving:", "dx:", dx, "dy:", dy, "dist:", dist, "dirX:", dirX, "dirY:", dirY, this.vx, this.vy);
      } else {
        // Reached destination
        this.vx = 0;
        this.vy = 0;
        this.x = this.targetX;
        this.y = this.targetY;

        // console.log("Arrived at target:", this.targetX, this.targetY);

        this.targetX = null;
        this.targetY = null;
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

    // // Fallback: draw grey rectangle
    
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, 20, 20);
  }
}
// Auto-convert whole library into Attack instances
const attacks = attackLibrary.map(data => new Attack(data));

// Example usage:
const fireball = attacks[0];  // Fireball


