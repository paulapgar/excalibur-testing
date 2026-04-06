import { Actor, vec } from "excalibur";
import { Resources } from "./resources";

export class Ship extends Actor {
  private rotationSpeed = 200; // degrees per second
  private moveSpeed = 100; // pixels per second
  private velocityX = 0;
  private velocityY = 0;

  constructor() {
    super({
      name: "Ship",
      pos: vec(0, 0), // Center of 800x600 screen
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

  override onInitialize() {
    // Use the ship image sprite
    this.graphics.use(Resources.Ship.toSprite());
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

    // Apply velocity (no friction in zero gravity)
    // this.pos = this.pos.add(
    //   vec(this.velocityX * elapsedSeconds, this.velocityY * elapsedSeconds),
    // );
    this.vel = vec(this.velocityX, this.velocityY); // Update Excalibur's internal velocity for collision detection, etc.
  }

  override onPostUpdate(_engine: any, _elapsedMs: number): void {
    // No additional logic needed here for now
  }
}
