import { BoxBufferGeometry, CanvasTexture, Mesh, MeshStandardMaterial, Sprite, SpriteMaterial, Vector2 } from 'three';
import { ClickRole } from '../../components/game/viewport/helpers/PhysicsCommands';
import { AssetLoader } from './asset-loader';
import { Color } from './loaderTypes';

export class PredefinedObjectGenerator {
  public static generateGameBoard(): Mesh {
    const gameBoardGeometry = new BoxBufferGeometry(100, 1, 100);
    const gameBoardMat = new MeshStandardMaterial({ color: 0xffffff });
    gameBoardMat.roughness = 0.475;
    gameBoardMat.map = AssetLoader.loadTexture(AssetLoader.defaultGameboardTexturePath);
    gameBoardMat.needsUpdate = true;

    const gameBoard: Mesh<BoxBufferGeometry, MeshStandardMaterial> = new Mesh(gameBoardGeometry, gameBoardMat);
    gameBoard.position.y = -0.1;
    gameBoard.castShadow = false;
    gameBoard.receiveShadow = true;
    gameBoard.name = 'gameboard';
    gameBoard.userData.clickRole = ClickRole.board;

    return gameBoard;
  }

  public static generateBordBoundary(length: number, rotatedLandscape: boolean, center: Vector2): Mesh {
    let w = 0.3,
      d = 0.3;
    if (rotatedLandscape) {
      w = length + 0.3;
    } else {
      d = length + 0.3;
    }

    const gameBoundaryGeo = new BoxBufferGeometry(w, 0.3, d);
    const gameBoundaryMat = new MeshStandardMaterial({ color: 0xfadd12 });
    gameBoundaryMat.metalness = 1;
    gameBoundaryMat.roughness = 0.06;

    const gameBoundary = new Mesh(gameBoundaryGeo, gameBoundaryMat);
    gameBoundary.castShadow = true;
    gameBoundary.receiveShadow = true;
    gameBoundary.position.set(center.x, 0.7, center.y);
    return gameBoundary;
  }

  public static generatePlayerLabelSprite(playerName: string): Sprite {
    return this.createLabelSprite(
      playerName,
      70,
      'Roboto',
      new Color(1, 1, 1, 1),
      new Color(0.24, 0.24, 0.24, 0.9),
      new Color(0.1, 0.1, 0.1, 0),
      0,
      4
    );
  }

  private static createLabelSprite(
    text: string,
    fontSize?: number,
    font?: string,
    textColor?: Color,
    backgroundColor?: Color,
    borderColor?: Color,
    borderThickness?: number,
    radius?: number
  ): Sprite {
    // Default values
    fontSize = fontSize || 16;
    font = font || 'Arial';
    textColor = textColor || new Color(1, 1, 1, 1);
    backgroundColor = backgroundColor || new Color(0, 0, 0, 1);
    borderColor = borderColor || new Color(0.1, 0.1, 0.1, 1);
    borderThickness = borderThickness || 4;
    radius = radius || 6;

    text = ' ' + text + ' ';

    // Build the HTMLCanvas that text is rendered to
    const canvas = document.createElement('canvas');
    canvas.width = 300 + borderThickness;
    canvas.height = fontSize * 1.4 + borderThickness;
    this.drawCanvas(canvas, text, fontSize, font, textColor, backgroundColor, borderColor, borderThickness, radius);
    const spriteMap: CanvasTexture = new CanvasTexture(canvas);
    spriteMap.anisotropy = 16;

    // Create a sprite that is then rendered in the 3D world of WebGL
    const spriteMaterial = new SpriteMaterial({ map: spriteMap });
    spriteMaterial.transparent = true;
    const sprite = new Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 75, canvas.height / 75, 1);
    return sprite;
  }

  private static drawCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    fontSize: number,
    font: string,
    textColor: Color,
    backgroundColor: Color,
    borderColor: Color,
    borderThickness: number,
    radius: number
  ) {
    const context = canvas.getContext('2d');
    context.font = 'Bold ' + fontSize + 'px ' + font;

    // get size data (height depends only on font size)
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    canvas.width = textWidth + borderThickness;
    context.font = fontSize + 'px ' + font;
    context.fillStyle = backgroundColor.toCSStext();
    context.strokeStyle = borderColor.toCSStext();
    context.lineWidth = borderThickness;
    this.drawSvgBackground(context, borderThickness / 2, borderThickness / 2, textWidth, fontSize * 1.4, radius);
    context.fillStyle = textColor.toCSStext();
    context.fillText(text, borderThickness, fontSize + borderThickness);
  }

  private static drawSvgBackground(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
