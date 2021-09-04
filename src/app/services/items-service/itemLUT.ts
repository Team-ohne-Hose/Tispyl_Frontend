enum executeTypes { // even numbers are targeted actions, odd numbers are not targeted
  UNTARGETED = 1,
  TARGETED = 2,
}

interface Item {
  id: number;
  weight: number;
  name: string;
  description: string;
  imgUrl: string;
  executeType: executeTypes;
}

const itemTable: { list: Item[]; count: number } = {
  list: [
    {
      id: 0,
      weight: 1,
      name: 'Wirt',
      description: 'Verteile 3 Rationen',
      imgUrl: '../assets/items/wirt.png',
      executeType: executeTypes.TARGETED,
    },
    {
      id: 1,
      weight: 1,
      name: 'Diplomat',
      description: 'Stelle eine Regel auf',
      imgUrl: '../assets/items/Diplomat.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 2,
      weight: 1,
      name: 'Klon',
      description: 'Ein anderer Mitspieler muss deine nächste Aufgabe auch machen',
      imgUrl: '../assets/items/klon.png',
      executeType: executeTypes.TARGETED,
    },
    {
      id: 3,
      weight: 1,
      name: 'Beste Freunde Gulasch',
      description: 'Wähle einen Trinkbuddy',
      imgUrl: '../assets/items/BesteFreundeGulasch.png',
      executeType: executeTypes.TARGETED,
    },
    {
      id: 4,
      weight: 1,
      name: 'Todfeind',
      description: 'Löse eine Trinkbuddy Verbindung auf',
      imgUrl: '../assets/items/todfeind.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 5,
      weight: 1,
      name: 'Joker',
      description: 'Führe ein beliebiges Feld aus',
      imgUrl: '../assets/items/joker.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 6,
      weight: 1,
      name: 'MOAB',
      description: 'Alle rücken 10 Felder zurück',
      imgUrl: '../assets/items/moab.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 7,
      weight: 1,
      name: 'Assasin',
      description: 'Ein Spieler muss einen Ring nach unten',
      imgUrl: '../assets/items/assasin.png',
      executeType: executeTypes.TARGETED,
    },
    {
      id: 8,
      weight: 1,
      name: 'Sabotage',
      description: 'Ein Spieler muss 5 Felder zurück',
      imgUrl: '../assets/items/sabotage.png',
      executeType: executeTypes.TARGETED,
    },
    {
      id: 9,
      weight: 1,
      name: 'Ah shit, here we go again',
      description: 'Spielt danach noch eine Runde Tischspiel',
      imgUrl: '../assets/items/ASHWGA.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 10,
      weight: 1,
      name: 'Trittbrettfahrer',
      description:
        'Exe dein Getränk. Schaffst du es müssen alle anderen dir gleich tun.' +
        '(Dein Getränk muss mindestens halb voll sein wenn du dieses Item nutzt.)',
      imgUrl: '../assets/items/Trittbrettfahrer.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 11,
      weight: 1,
      name: 'Losing is Fun',
      description: 'Gehe zurück zum Start',
      imgUrl: '../assets/items/lachweinler.png',
      executeType: executeTypes.UNTARGETED,
    },
    {
      id: 12,
      weight: 1,
      name: 'Anonymer Tipp',
      description: 'ein Spieler muss nächste Runde aussetzen',
      imgUrl: '../assets/items/anonym.png',
      executeType: executeTypes.TARGETED,
    },
  ],
  count: 13,
};
export { Item, itemTable, executeTypes };
