import {
  DefaultLoader,
  Engine,
  ExcaliburGraphicsContext,
  Scene,
  SceneActivationContext,
  Text,
  Font,
  Color,
} from "excalibur";
import { Ship } from "./ship";

export class MyLevel extends Scene {
  private ship!: Ship;

  override onInitialize(engine: Engine): void {
    // Scene.onInitialize is where we recommend you perform the composition for your game
    this.ship = new Ship();
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

    ctx.save();
    ctx.translate(20, 20);
    debugText.draw(ctx, 0, 0);
    shipDebugText.draw(ctx, 0, 20);
    shipPosDebugText.draw(ctx, 0, 40);
    ctx.restore();
  }
}
