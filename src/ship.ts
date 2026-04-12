import { Actor, vec } from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";

export class GunPort extends Actor {
  constructor() {
    super({
      name: "GunPort",
      pos: vec(0, -7),
    });
  }
}

export class Ship extends Actor {
  private rotationSpeed = 200; // degrees per second
  private moveSpeed = 100; // pixels per second
  private velocityX = 0;
  private velocityY = 0;
  public bulletPool: Bullet[] = [];
  private readonly bulletPoolSize = 20;
  private gunPort!: GunPort;
  private fireCooldown = 0; // ms remaining before next shot allowed
  // Zone indices for background tiling
  public zoneX: number = 0;
  public zoneY: number = 0;

  constructor() {
    super({
      name: "Ship",
      //pos: vec(0, 0), // Center of 800x600 screen
      width: 16, // change this to match your ship image dimensions
      height: 16, // change this to match your ship image dimensions
    });
  }

  // Expose velocity for debugging/other systems
  public get velocity() {
    return { x: this.velocityX, y: this.velocityY };
  }

  // Return the scalar speed (combined magnitude of velocityX and velocityY)
  public getTotalVelocity(): number {
    return Math.hypot(this.velocityX, this.velocityY);
  }

  override onInitialize(engine: any) {
    // Use the ship image sprite
    this.graphics.use(Resources.Ship.toSprite());

    // Add gun port child entity at the nose of the ship
    this.gunPort = new GunPort();
    this.addChild(this.gunPort);

    // Create object pool of bullets, hidden and non-colliding until fired
    for (let i = 0; i < this.bulletPoolSize; i++) {
      const bullet = new Bullet();
      this.bulletPool.push(bullet);
      engine.currentScene.add(bullet);
    }
  }

  override onPreUpdate(engine: any, elapsedMs: number): void {
    const elapsedSeconds = elapsedMs / 1000;

    // Handle rotation
    if (engine.input.keyboard.isHeld("ArrowLeft")) {
      this.rotation -= this.rotationSpeed * elapsedSeconds * (Math.PI / 180);
    }
    if (engine.input.keyboard.isHeld("ArrowRight")) {
      this.rotation += this.rotationSpeed * elapsedSeconds * (Math.PI / 180);
    }
    // zero gravity, ship continues moving
    if (engine.input.keyboard.isHeld("ArrowUp")) {
      // Calculate acceleration based on current rotation (forward thrust)
      // In Excalibur, rotation 0 points right; adjust so 0 points up
      const moveAngle = this.rotation - Math.PI / 2;
      const acceleration = this.moveSpeed;
      this.velocityX += Math.cos(moveAngle) * acceleration * elapsedSeconds;
      this.velocityY += Math.sin(moveAngle) * acceleration * elapsedSeconds;
    }

    // Reverse thrust (backwards) when holding down arrow
    if (engine.input.keyboard.isHeld("ArrowDown")) {
      const moveAngle = this.rotation - Math.PI / 2;
      const acceleration = this.moveSpeed;
      this.velocityX -= Math.cos(moveAngle) * acceleration * elapsedSeconds;
      this.velocityY -= Math.sin(moveAngle) * acceleration * elapsedSeconds;
    }

    // Clamp velocity to max speed
    const maxSpeed = 300;
    const speed = Math.hypot(this.velocityX, this.velocityY);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocityX *= scale;
      this.velocityY *= scale;
    }

    // Apply velocity (no friction in zero gravity)
    // this.pos = this.pos.add(
    //   vec(this.velocityX * elapsedSeconds, this.velocityY * elapsedSeconds),
    // );
    this.vel = vec(this.velocityX, this.velocityY); // Update Excalibur's internal velocity for collision detection, etc.

    // Tick down fire cooldown
    if (this.fireCooldown > 0) {
      this.fireCooldown -= elapsedMs;
    }

    // Fire a bullet on spacebar press (hold-friendly: fires again once cooldown expires)
    if (engine.input.keyboard.isHeld("Space") && this.fireCooldown <= 0) {
      this.fireCooldown = 100;
      this.fireBullet();
    }
  }

  private fireBullet(): void {
    // Get the next inactive bullet from the pool
    const bullet = this.bulletPool.find((b) => !b.graphics.isVisible);
    if (!bullet) return;

    // Position bullet at the gun port world position
    bullet.pos = this.gunPort.globalPos;

    // Fire in the direction the ship is pointing, adding ship's current velocity
    const moveAngle = this.rotation - Math.PI / 2;
    const bulletSpeed = 200;
    bullet.vel = vec(
      this.velocityX + Math.cos(moveAngle) * bulletSpeed,
      this.velocityY + Math.sin(moveAngle) * bulletSpeed,
    );

    bullet.activate(this.gunPort.globalPos);
  }

  // Calculate and store which background zone the ship is in
  public updateZone(): { x: number; y: number } {
    // +500 before division by 1000, +400 before division by 800 per existing logic
    this.zoneX = Math.floor((this.pos.x + 500) / 1000);
    this.zoneY = Math.floor((this.pos.y + 400) / 800);
    return { x: this.zoneX, y: this.zoneY };
  }

  override onPostUpdate(_engine: any, _elapsedMs: number): void {
    // No additional logic needed here for now
  }
}
