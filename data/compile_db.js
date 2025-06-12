const fs = require('fs');
const path = require('path');

const cardsRoot = path.join(__dirname, 'cards');
const decksDir = path.join(__dirname, 'decks');
const playersDir = path.join(__dirname, 'players');
const outputFile = path.join(__dirname, 'db.json');

function getAllJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(file => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllJsonFiles(filePath));
    } else if (file.isFile() && file.name.endsWith('.json')) {
      results.push(filePath);
    }
  });
  return results;
}

function loadJsonFiles(filePaths) {
  return filePaths.map(fp => {
    try {
      return JSON.parse(fs.readFileSync(fp, 'utf-8'));
    } catch (e) {
      console.error(`Error parsing ${fp}:`, e);
      return null;
    }
  }).filter(Boolean);
}

function compileDatabase() {
  // Compile cards
  const cardFiles = getAllJsonFiles(path.join(cardsRoot, 'sets'));
  const cards = loadJsonFiles(cardFiles);

  // Compile decks
  const deckFiles = getAllJsonFiles(decksDir);
  const decks = loadJsonFiles(deckFiles);

  // Compile players
  const playerFiles = getAllJsonFiles(playersDir);
  const players = loadJsonFiles(playerFiles);

  const db = { cards, decks, players };
  fs.writeFileSync(outputFile, JSON.stringify(db, null, 2));
  console.log(`Compiled database into ${outputFile}`);
}

compileDatabase();
