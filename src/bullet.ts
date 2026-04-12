import { Actor, CollisionType, Vector, ColliderComponent } from "excalibur";
import { Resources } from "./resources";

const BULLET_MAX_DISTANCE = 500;

export class Bullet extends Actor {
  private spawnPos: Vector = Vector.Zero;
  private isLive: boolean = false;

  constructor() {
    super({
      name: "Bullet",
      collisionType: CollisionType.PreventCollision,
    });
    // Start bullets far off-screen to prevent accidental collisions
    this.pos = new Vector(-10000, -10000);
  }

  override onInitialize() {
    this.graphics.use(Resources.Bullet.toSprite());
    this.graphics.isVisible = false;

    // Initialize the ColliderComponent
    const collider = new ColliderComponent();
    this.addComponent(collider, true);

    // Set up a circular collider
    collider.useCircleCollider(2);

    // Subscribe to collision events
    collider.events.on("collisionstart", (event: any) => {
      // Only deactivate when hitting an asteroid (and only if still live)
      if (this.isLive && event.other?.owner?.name?.startsWith("Asteroid")) {
        this.deactivate();
      }
    });
  }

  activate(spawnPos: Vector): void {
    this.pos = spawnPos.clone();
    this.spawnPos = spawnPos.clone();
    this.graphics.opacity = 1;
    this.graphics.isVisible = true;
    this.body.collisionType = CollisionType.Passive;
    this.isLive = true;
  }

  deactivate(): void {
    this.isLive = false;
    this.graphics.isVisible = false;
    this.graphics.opacity = 1;
    this.vel = Vector.Zero;
    this.body.collisionType = CollisionType.PreventCollision;
    // Move bullet far away to prevent any position-based collisions
    this.pos = new Vector(-10000, -10000);
  }

  override onPreUpdate(_engine: any, _elapsedMs: number): void {
    if (!this.isLive || !this.graphics.isVisible) return;

    const distance = this.pos.distance(this.spawnPos);

    if (distance >= BULLET_MAX_DISTANCE) {
      this.deactivate();
      return;
    }

    // Fade linearly over the last half of the travel distance
    const fadeStart = BULLET_MAX_DISTANCE * 0.75;
    if (distance > fadeStart) {
      const t = (distance - fadeStart) / (BULLET_MAX_DISTANCE - fadeStart);
      this.graphics.opacity = 1 - t;
    }
  }
}
