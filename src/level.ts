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
} from "excalibur";
import { Ship } from "./ship";
import { BackgroundTile } from "./background-tile";

export class MyLevel extends Scene {
  private ship!: Ship;
  private starFields: BackgroundTile[] = [];

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
    // Use Excalibur's lock-to-actor camera strategy to reduce jitter
    engine.currentScene.camera.strategy.lockToActor(this.ship);
    // Default integer zoom for pixel-perfect rendering
    engine.currentScene.camera.zoom = 1;
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

  override onPreUpdate(_engine: Engine, _elapsedMs: number): void {
    // Called before anything updates in the scene
  }

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
  }

  override onPreDraw(_ctx: ExcaliburGraphicsContext, _elapsedMs: number): void {
    // Called before Excalibur draws to the screen
  }

  override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
    // Called after Excalibur draws to the screen
    // Draw debug text in top-left corner
    const fps = elapsedMs > 0 ? Math.round(1000 / elapsedMs) : 0;
    const debugText = new Text({
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
    debugText.draw(ctx, 0, 0);
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
