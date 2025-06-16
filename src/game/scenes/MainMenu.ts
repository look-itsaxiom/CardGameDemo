import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { IPlayerInfo } from '../../../data/db';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.title = this.add.text(512, 50, 'Card Game Demo', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }

    startGame (activePlayerInfo: IPlayerInfo | null, opponentPlayerInfo: IPlayerInfo | null)
    {
        this.scene.start('Game', { activePlayerInfo, opponentPlayerInfo });
    }
}
