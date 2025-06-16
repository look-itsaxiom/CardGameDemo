import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { I3v3DeckLoadoutInfo, IPlayerInfo } from '../data/db';
import db from '../data/db';

function App()
{
    const players = db.getPlayers();
    const [activePlayerInfo, setActivePlayerInfo] = useState<IPlayerInfo | null>(null);
    const [opponentPlayerInfo, setOpponentPlayerInfo] = useState<IPlayerInfo | null>(null);
    let playerActiveDeck = {} as I3v3DeckLoadoutInfo;
    let opponentActiveDeck = {} as I3v3DeckLoadoutInfo;

    useEffect(() => {
        playerActiveDeck = db.getDeckById(activePlayerInfo?.active_deck || '') || {} as I3v3DeckLoadoutInfo;
    }, [activePlayerInfo]);

    useEffect(() => {
        opponentActiveDeck = db.getDeckById(opponentPlayerInfo?.active_deck || '') || {} as I3v3DeckLoadoutInfo;
    }, [opponentPlayerInfo]);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const startGame = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.startGame(activePlayerInfo, opponentPlayerInfo);
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        console.log('Current Scene:', scene);
        
    }

    const setActivePlayer = (playerId: string, opponentId: string) => () => {
        const playerIndex = players.findIndex((player) => player.id === playerId);
        const opponentIndex = players.findIndex((player) => player.id === opponentId);
        setActivePlayerInfo(players[playerIndex]);
        setOpponentPlayerInfo(players[opponentIndex]);
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <p>Active Player: {activePlayerInfo?.name}</p>
                <p>Active Deck: {activePlayerInfo?.active_deck}</p>
                <div>
                    <button className="button" onClick={setActivePlayer('playerA', 'playerB')}>Set Active Player A</button>
                </div>
                <div>
                    <button className="button" onClick={setActivePlayer('playerB', 'playerA')}>Set Active Player B</button>
                </div>
                <div>
                    <button disabled={!activePlayerInfo} className="button" onClick={startGame}>Start Game</button>
                </div>
            </div>
        </div>
    )
}

export default App
