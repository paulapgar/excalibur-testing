import { Actor, vec } from "excalibur";
import { Resources } from "./resources";

export class Ship extends Actor {
  private rotationSpeed = 100; // degrees per second
  private moveSpeed = 200; // pixels per second
  private velocityX = 0;
  private velocityY = 0;
  private screenWidth = 800;
  private screenHeight = 600;
  shipSize = 40;

  constructor() {
    super({
      name: "Ship",
      pos: vec(400, 300), // Center of 800x600 screen
      width: 40,
      height: 40,
    });
  }

  override onInitialize() {
    // Use the ship image sprite
    this.graphics.add(Resources.Ship.toSprite());
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

    // Handle bouncing off screen edges
    const halfSize = this.shipSize / 2;

    // Left and right edges
    if (this.pos.x - halfSize < 0) {
      this.pos = vec(halfSize, this.pos.y);
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.pos.x + halfSize > this.screenWidth) {
      this.pos = vec(this.screenWidth - halfSize, this.pos.y);
      this.velocityX = -Math.abs(this.velocityX);
    }

    // Top and bottom edges
    if (this.pos.y - halfSize < 0) {
      this.pos = vec(this.pos.x, halfSize);
      this.velocityY = Math.abs(this.velocityY);
    } else if (this.pos.y + halfSize > this.screenHeight) {
      this.pos = vec(this.pos.x, this.screenHeight - halfSize);
      this.velocityY = -Math.abs(this.velocityY);
    }

    // Apply velocity (no friction in zero gravity)
    this.pos = this.pos.add(
      vec(this.velocityX * elapsedSeconds, this.velocityY * elapsedSeconds),
    );
  }
}
