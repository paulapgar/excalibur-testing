import { Actor, CollisionType, Vector } from "excalibur";
import { Resources } from "./resources";

const BULLET_MAX_DISTANCE = 500;

export class Bullet extends Actor {
  private spawnPos: Vector = Vector.Zero;

  constructor() {
    super({
      name: "Bullet",
      collisionType: CollisionType.PreventCollision,
    });
  }

  override onInitialize() {
    this.graphics.use(Resources.Bullet.toSprite());
    this.graphics.visible = false;
  }

  activate(spawnPos: Vector): void {
    this.pos = spawnPos.clone();
    this.spawnPos = spawnPos.clone();
    this.graphics.opacity = 1;
    this.graphics.visible = true;
    this.body.collisionType = CollisionType.Active;
  }

  deactivate(): void {
    this.graphics.visible = false;
    this.graphics.opacity = 1;
    this.vel = Vector.Zero;
    this.body.collisionType = CollisionType.PreventCollision;
  }

  override onPreUpdate(_engine: any, _elapsedMs: number): void {
    if (!this.graphics.visible) return;

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
