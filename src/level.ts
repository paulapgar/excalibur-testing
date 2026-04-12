import {
  DefaultLoader,
  Engine,
  ExcaliburGraphicsContext,
  Scene,
  SceneActivationContext,
  Text,
  Font,
  Color,
  vec,
  CollisionType,
  Vector,
} from "excalibur";
import { Ship } from "./ship";
import { BackgroundTile } from "./background-tile";
import { Asteroid } from "./asteroid";

export class MyLevel extends Scene {
  private ship!: Ship;
  private starFields: BackgroundTile[] = [];
  public asteroidPool: Asteroid[] = [];
  private readonly asteroidPoolSize = 20;
  private asteroidSpawnCooldown = 0; // ms remaining before next asteroid can spawn

  override onInitialize(engine: Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    // Add nine background tiles at position 0,0 and keep references
    this.starFields = [];
    for (let i = 0; i < 9; i++) {
      const tile = new BackgroundTile();
      this.starFields.push(tile);
      this.add(tile);
    }

    this.ship = new Ship();
    this.ship.pos = vec(0, 0); // Center of scene/level
    // this happens automatically
    this.ship.updateZone();
    // Position background tiles based on the ship's current zone
    this.positionBackgroundTiles(this.ship.zoneX, this.ship.zoneY);
    this.add(this.ship); // Actors need to be added to a scene to be drawn

    // Create object pool of large asteroids, hidden and non-colliding until activated
    for (let i = 0; i < this.asteroidPoolSize; i++) {
      const asteroid = new Asteroid("large", "brown", this, this.ship);
      asteroid.graphics.isVisible = false;
      asteroid.body.collisionType = CollisionType.PreventCollision;
      this.asteroidPool.push(asteroid);
      engine.currentScene.add(asteroid);
    }

    // Use Excalibur's lock-to-actor camera strategy to reduce jitter
    engine.currentScene.camera.strategy.lockToActor(this.ship);
    // Default integer zoom for pixel-perfect rendering
    engine.currentScene.camera.zoom = 1;
  }

  /**
   * Spawn 3 medium asteroids 10 pixels from the destroyed asteroid's center
   * Inherits parent velocity and modifies based on spawn angle
   */
  public spawnMediumAsteroids(position: Vector, parentVelocity: Vector): void {
    for (let i = 0; i < 3; i++) {
      // Create a new medium brown asteroid
      const mediumAsteroid = new Asteroid("medium", "brown", this, this.ship);
      this.add(mediumAsteroid);

      // Random spacing around the circle for spawn angles
      const angle =
        (i / 3) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / 3);
      const spawnDistance = 10; // pixels from center

      // Position 10 pixels away from center at the angle
      const spawnPos = position.add(
        vec(Math.cos(angle) * spawnDistance, Math.sin(angle) * spawnDistance),
      );
      mediumAsteroid.pos = spawnPos;

      // Start with parent's velocity (halved), then add variation based on spawn angle
      const directionOffset = new Vector(Math.cos(angle), Math.sin(angle));
      const speedVariation = Math.random() * 20 + 30; // 30-50 pixels per second offset
      const variance = directionOffset.scale(speedVariation);
      const velocity = parentVelocity.scale(0.5).add(variance);

      const rotationSpeed = Math.random() * 4 - 2;

      mediumAsteroid.setMotion(velocity, rotationSpeed);

      // Enable collision
      mediumAsteroid.graphics.visible = true;
      mediumAsteroid.body.collisionType = CollisionType.Passive;
    }
  }

  /**
   * Spawn 3 small brown asteroids 10 pixels from the destroyed asteroid's center
   * Inherits parent velocity and modifies based on spawn angle
   */
  public spawnSmallAsteroids(position: Vector, parentVelocity: Vector): void {
    for (let i = 0; i < 3; i++) {
      // Create a new small brown asteroid
      const smallAsteroid = new Asteroid("small", "brown", this, this.ship);
      this.add(smallAsteroid);

      // Completely random spawn angle
      const angle = Math.random() * Math.PI * 2;
      const spawnDistance = 10; // pixels from center

      // Position 10 pixels away from center at the angle
      const spawnPos = position.add(
        vec(Math.cos(angle) * spawnDistance, Math.sin(angle) * spawnDistance),
      );
      smallAsteroid.pos = spawnPos;

      // Start with parent's velocity (halved), then add variation based on spawn angle
      const directionOffset = new Vector(Math.cos(angle), Math.sin(angle));
      const speedVariation = Math.random() * 20 + 30; // 30-50 pixels per second offset
      const variance = directionOffset.scale(speedVariation);
      const velocity = parentVelocity.scale(0.5).add(variance);

      const rotationSpeed = Math.random() * 4 - 2;

      smallAsteroid.setMotion(velocity, rotationSpeed);

      // Enable collision
      smallAsteroid.graphics.visible = true;
      smallAsteroid.body.collisionType = CollisionType.Passive;
    }
  }

  /**
   * Reset an asteroid to a new position and velocity
   * Places it 600 pixels from the ship at a random angle
   * Velocity points toward a random target within 300 pixels of the ship
   * Respects the asteroid spawn cooldown of 100ms
   */
  public resetAsteroid(asteroid: Asteroid): void {
    // Skip reset if spawn cooldown is active
    if (this.asteroidSpawnCooldown > 0) {
      return;
    }

    // Random angle around the ship
    const angle = Math.random() * Math.PI * 2;
    const distance = 600;

    // Position asteroid 600 pixels from ship at random angle
    const asteroidPos = this.ship.pos.add(
      vec(Math.cos(angle) * distance, Math.sin(angle) * distance),
    );
    asteroid.pos = asteroidPos;

    // Random target within 200 pixels of ship
    const targetOffset = 300;
    const targetX = this.ship.pos.x + (Math.random() - 0.5) * 2 * targetOffset;
    const targetY = this.ship.pos.y + (Math.random() - 0.5) * 2 * targetOffset;
    const target = new Vector(targetX, targetY);

    // Calculate direction from asteroid to target
    const direction = target.sub(asteroidPos).normalize();
    const speed = Math.random() * 40 + 60; // Random speed between 60-100 pixels per second

    // Set asteroid motion
    const rotationSpeed = Math.random() * 4 - 2; // Random float between -2 and 2
    asteroid.setMotion(direction.scale(speed), rotationSpeed);

    // Make visible and enable collision
    asteroid.graphics.visible = true;
    asteroid.body.collisionType = CollisionType.Passive;

    // Set spawn cooldown
    this.asteroidSpawnCooldown = 100;
  }

  override onPreLoad(_loader: DefaultLoader): void {
    // Add any scene specific resources to load
  }

  override onActivate(_context: SceneActivationContext<unknown>): void {
    // Called when Excalibur transitions to this scene
    // Only 1 scene is active at a time
  }

  override onDeactivate(_context: SceneActivationContext): void {
    // Called when Excalibur transitions away from this scene
    // Only 1 scene is active at a time
  }

  override onPreUpdate(_engine: Engine, _elapsedMs: number): void {}

  override onPostUpdate(_engine: Engine, _elapsedMs: number): void {
    // Called after everything updates in the scene
    // Update ship zone each frame and reposition background tiles when zone changes
    if (this.ship) {
      // save old zone values then update the ship's zone and compare
      const oldX = this.ship.zoneX;
      const oldY = this.ship.zoneY;
      this.ship.updateZone();
      const newX = this.ship.zoneX;
      const newY = this.ship.zoneY;
      if (newX !== oldX || newY !== oldY) {
        this.ship.zoneX = newX;
        this.ship.zoneY = newY;
        this.positionBackgroundTiles(this.ship.zoneX, this.ship.zoneY);
      }
    }

    // Tick down asteroid spawn cooldown
    if (this.asteroidSpawnCooldown > 0) {
      this.asteroidSpawnCooldown -= _elapsedMs;
    }

    // Check asteroids and reset those that were shot
    for (const asteroid of this.asteroidPool) {
      // If asteroid was shot (hidden), reset it
      if (!asteroid.graphics.isVisible) {
        this.resetAsteroid(asteroid);
      }
    }
  }

  override onPreDraw(_ctx: ExcaliburGraphicsContext, _elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
    // Draw debug text in top-left corner
    const fps = elapsedMs > 0 ? Math.round(1000 / elapsedMs) : 0;
    const fpsText = new Text({
      text: `FPS: ${fps}`,
      font: new Font({
        size: 14,
        family: "monospace",
      }),
      color: Color.White,
    });

    const shipVelText = this.ship
      ? (() => {
          const v = this.ship.velocity;
          const s = this.ship.getTotalVelocity();
          return `Vel: ${v.x.toFixed(1)}, ${v.y.toFixed(1)} (${s.toFixed(1)})`;
        })()
      : "Vel: -,- (-)";

    const shipDebugText = new Text({
      text: shipVelText,
      font: new Font({
        size: 14,
        family: "monospace",
      }),
      color: Color.White,
    });

    const shipPosText = this.ship
      ? `Ship: ${this.ship.pos.x.toFixed(1)}, ${this.ship.pos.y.toFixed(1)}`
      : "Ship: -,-";

    const shipPosDebugText = new Text({
      text: shipPosText,
      font: new Font({
        size: 14,
        family: "monospace",
      }),
      color: Color.White,
    });

    const shipPosZone = this.ship
      ? `Zone: ${this.ship.zoneX.toFixed(2)}, ${this.ship.zoneY.toFixed(2)}`
      : "Zone: -,-";

    const shipPosZoneText = new Text({
      text: shipPosZone,
      font: new Font({
        size: 14,
        family: "monospace",
      }),
      color: Color.White,
    });

    ctx.save();
    ctx.translate(20, 20);
    fpsText.draw(ctx, 0, 0);
    shipDebugText.draw(ctx, 0, 20);
    shipPosDebugText.draw(ctx, 0, 40);
    shipPosZoneText.draw(ctx, 0, 60);
    ctx.restore();
  }

  private positionBackgroundTiles(zoneX: number, zoneY: number) {
    // Position the 9 background tiles in a 3x3 grid
    const tileSizeX = 1000; // Assuming each tile is 800x800 pixels
    const tileSizeY = 800;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        this.starFields[index].pos.setTo(
          zoneX * tileSizeX - tileSizeX / 2 + j * tileSizeX,
          zoneY * tileSizeY - tileSizeY / 2 + i * tileSizeY,
        );
      }
    }
  }
}
