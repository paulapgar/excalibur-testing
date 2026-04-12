import {
  Actor,
  CollisionType,
  Vector,
  ColliderComponent,
  Scene,
} from "excalibur";
import { Resources } from "./resources";
import { Ship } from "./ship";

export type AsteroidSize = "large" | "medium" | "small";
export type AsteroidColor = "brown" | "gray" | "red";

export class Asteroid extends Actor {
  public mySize: AsteroidSize;
  public myColor: AsteroidColor;
  private radius: number;
  private level: Scene | null = null;
  private ship: Ship | null = null;

  constructor(
    size: AsteroidSize,
    color: AsteroidColor,
    level?: Scene,
    ship?: Ship,
  ) {
    // Set radius based on size
    const radiusMap: Record<AsteroidSize, number> = {
      large: 32,
      medium: 16,
      small: 4,
    };
    const collisionRadius = radiusMap[size];

    super({
      name: `Asteroid_${size}_${color}`,
      collisionType: CollisionType.Active,
    });

    this.level = level || null;
    this.ship = ship || null;

    this.mySize = size;
    this.myColor = color;
    this.radius = collisionRadius;
  }

  override onInitialize() {
    // Use the asteroid image sprite based on size and color
    const sprite = this.getAsteroidSprite();
    this.graphics.use(sprite);

    // Initialize the ColliderComponent
    const collider = new ColliderComponent();
    this.addComponent(collider, true);

    // Set up a circular collider with the asteroid's radius
    collider.useCircleCollider(this.radius);

    // Subscribe to collision events
    collider.events.on("collisionstart", (event: any) => {
      // Check if colliding with a bullet
      if (event.other?.owner?.name === "Bullet") {
        // If this is a large asteroid, spawn children before hiding
        if (this.mySize === "large" && this.level) {
          (this.level as any).spawnMediumAsteroids(this.pos, this.vel);
          // Hide and move away large asteroid (will be reset for reuse)
          this.graphics.isVisible = false;
          this.body.collisionType = CollisionType.PreventCollision;
          this.pos = new Vector(-10000, -10000);
        } else if (this.mySize === "medium" && this.level) {
          // If this is a medium asteroid, spawn small asteroids before destroying
          (this.level as any).spawnSmallAsteroids(this.pos, this.vel);
          // Destroy medium asteroids completely
          this.kill();
        } else if (this.mySize === "small") {
          // Destroy small asteroids completely
          this.kill();
        }
      }
    });
  }

  override onPreUpdate(_engine: any, _elapsedMs: number): void {
    // Check if asteroid is too far from ship and despawn if so
    if (this.ship && this.graphics.isVisible) {
      const distance = this.ship.pos.distance(this.pos);
      if (distance > 800) {
        this.graphics.isVisible = false;
        this.body.collisionType = CollisionType.PreventCollision;
      }
    }
  }

  /**
   * Get the appropriate sprite based on asteroid size and color
   */
  private getAsteroidSprite() {
    switch (`${this.mySize}_${this.myColor}`) {
      case "large_brown":
        return Resources.AsteroidLargeBrown.toSprite();
      case "medium_brown":
        return Resources.AsteroidMediumBrown.toSprite();
      case "small_brown":
        return Resources.AsteroidSmallBrown.toSprite();
      case "large_gray":
      case "large_red":
      case "medium_gray":
      case "medium_red":
      case "small_gray":
      case "small_red":
      default:
        return Resources.AsteroidLargeBrown.toSprite();
    }
  }

  /**
   * Get the dimensions of the asteroid
   */
  public getDimensions(): { width: number; height: number } {
    return {
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  /**
   * Set velocity and rotation for the asteroid
   */
  public setMotion(velocity: Vector, rotationSpeed: number = 0): void {
    this.vel = velocity;
    this.angularVelocity = rotationSpeed;
  }
}
