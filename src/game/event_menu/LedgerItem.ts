import { GameObjects, Scene, Textures } from 'phaser';
import { createSquircle } from '../ui/Squircle';

export class LedgerItem extends GameObjects.Container {
    sprite: GameObjects.Sprite;

    onClick?: () => void;

    pressingDown: boolean

    squircle: GameObjects.NineSlice;
    username: GameObjects.Text;
    description: GameObjects.Text;
    ledgerItemType: GameObjects.Text;
    timestamp: GameObjects.Text;
    chainID: string | null;

    constructor(scene: Scene, x: number, y: number, width: number, height: number, fontSize: string, username: string, description: string, ledgerItemType: string, id: string | null) {
        super(scene, x, y);
        this.addToUpdateList();

        let left = -width * 0.45;
        let right = width * 0.45;
        let top = -height * 0.25;
        let bottom = height * 0.25;

        this.squircle = createSquircle(scene, 0, 0, width, height, 0xFFFFFF, 0.75);
        this.add(this.squircle);

        this.username = new GameObjects.Text(scene, left, top, username, { fontSize: fontSize, fontFamily: "Quantico", color: "#000", fontStyle: 'bold' });
        this.username.setOrigin(0, 0.5);
        this.add(this.username);

        this.description = new GameObjects.Text(scene, left, bottom, description, { fontSize: fontSize, fontFamily: "Quantico", color: "#000" });
        this.description.setOrigin(0, 0.5);
        this.add(this.description);

        this.ledgerItemType = new GameObjects.Text(scene, right, top, ledgerItemType, { fontSize: fontSize, fontFamily: "Quantico", color: "#000" });
        this.ledgerItemType.setOrigin(1, 0.5);
        this.add(this.ledgerItemType);

        this.timestamp = new GameObjects.Text(scene, right, bottom, "some time ago...", { fontSize: fontSize, fontFamily: "Quantico", color: "#000" });
        this.timestamp.setOrigin(1, 0.5);
        this.add(this.timestamp);

        this.chainID = id;

        const hitArea: Phaser.Types.Input.InputConfiguration = {
            hitArea: new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            draggable: false,
            dropZone: false,
            useHandCursor: true,
        }
        this.setInteractive(hitArea);

        this.on('pointerdown', this.pointerDown);
    }

    pointerDown(pointer: Phaser.Input.Pointer, x: number, y: number, e: Phaser.Types.Input.EventData) {
        if (this.chainID == null) {
            return;
        }

        window.open(`https://suiscan.xyz/testnet/tx/${this.chainID}`);
    }
}