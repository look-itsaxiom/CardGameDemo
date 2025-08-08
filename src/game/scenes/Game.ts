import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x2c5530);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);

        this.gameText = this.add.text(512, 384, 'Initializing Card Game Engine...\nStarting Battle Arena', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Auto-transition to PlayableGameBoard after engine initialization
        this.time.delayedCall(1500, () => {
            this.scene.start('PlayableGameBoard');
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('PlayableGameBoard');
    }
}
