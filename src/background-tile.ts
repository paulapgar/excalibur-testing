import { Actor, vec } from "excalibur";
import { Resources } from "./resources";

export class BackgroundTile extends Actor {
  constructor() {
    super({
      pos: vec(0, 0),
      z: -100,
    });
  }

  override onInitialize(): void {
    //this.anchor.setTo(0.5, 0.5); // Center anchor (default)
    // Use the starfield image as the visual for this actor
    this.graphics.use(Resources.Starfield.toSprite());
  }
}
