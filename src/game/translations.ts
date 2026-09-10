export type Lang = "en" | "nl";

export interface Translation {
  header: {
    title: string;
    subtitle: string;
  };
  mode: {
    easy: string;
    advanced: string;
    expert: string;
    easyDesc: string;
    advancedDesc: string;
    expertDesc: string;
  };
  lang: {
    label: string;
  };
  tutorial: {
    button: string;
    title: string;
    start: string;
    next: string;
    back: string;
    skip: string;
    close: string;
    pages: TutorialPage[];
  };
  commands: {
    forward: string;
    backward: string;
    left: string;
    right: string;
    forwardHint: string;
    backwardHint: string;
    leftHint: string;
    rightHint: string;
    add: string;
    sequence: string;
    empty: string;
    clear: string;
    remove: string;
  };
  advanced: {
    placeholder: string;
    hint: string;
    run: string;
    examples: string;
    errorUnknown: string;
    errorSyntax: string;
    errorEmpty: string;
    errorConditionalNotAllowed: string;
  };
  expert: {
    placeholder: string;
    hint: string;
    run: string;
    errorUnknown: string;
    errorSyntax: string;
    errorEmpty: string;
    errorIndent: string;
  };
  actions: {
    run: string;
    reset: string;
    retry: string;
    replay: string;
    newMaze: string;
  };
  feedback: {
    running: string;
    wall: string;
    bounds: string;
    success: string;
    notReached: string;
    limit: string;
    runningCmd: string;
    idle: string;
  };
  scoring: {
    moves: string;
    optimal: string;
    stars: string;
    threeStar: string;
    twoStar: string;
    oneStar: string;
    result: string;
  };
  mazes: {
    title: string;
    level: string;
  };
  concepts: {
    loopTitle: string;
    loopBody: string;
    conditionalTitle: string;
    conditionalBody: string;
    close: string;
  };
  footer: string;
}

export interface TutorialPage {
  title: string;
  body: string;
}

const en: Translation = {
  header: {
    title: "Robot Maze Quest",
    subtitle: "Guide the robot through the maze and collect the star!",
  },
  mode: {
    easy: "Easy Mode",
    advanced: "Advanced Mode",
    expert: "Expert Mode",
    easyDesc: "Tap colorful buttons to move the robot — perfect for ages 6 to 12.",
    advancedDesc: "Write Python-style commands and use repeat loops to save typing — for ages 10 and up.",
    expertDesc: "Everything in Advanced, plus if/else conditions like wall_ahead() — for confident coders.",
  },
  lang: { label: "Language" },
  tutorial: {
    button: "Tutorial",
    title: "How to Play",
    start: "Start Game",
    next: "Next",
    back: "Back",
    skip: "Skip",
    close: "Close",
    pages: [
      {
        title: "Welcome!",
        body: "Your mission is simple: guide the friendly robot through the maze to reach the glowing star. Plan your moves carefully and collect all three stars by being efficient!",
      },
      {
        title: "The Goal",
        body: "The robot starts on the green start tile. The star sits at the end of the maze. You need to give the robot a sequence of commands that leads it to the star without bumping into walls.",
      },
      {
        title: "Movement Commands",
        body: "Move Forward sends the robot one tile ahead. Move Backward sends it one tile behind. Turn Left and Turn Right rotate the robot in place — they don't move it, but they change which way it faces.",
      },
      {
        title: "Two Ways to Play",
        body: "In Easy Mode you build a command list by tapping big colorful buttons — great for younger kids. In Advanced Mode you type Python-style commands like move_forward() in a code editor — perfect for teens learning to code.",
      },
      {
        title: "Star Rating",
        body: "Your score depends on how efficiently you solve the maze. The app calculates the shortest possible route. Three stars means you matched it. Two stars means a few extra moves. One star means you made it, but with plenty of detours!",
      },
    ],
  },
  commands: {
    forward: "Move Forward",
    backward: "Move Backward",
    left: "Turn Left",
    right: "Turn Right",
    forwardHint: "Move one tile in the direction the robot faces",
    backwardHint: "Move one tile backward",
    leftHint: "Rotate the robot 90° to the left",
    rightHint: "Rotate the robot 90° to the right",
    add: "Add",
    sequence: "Your Commands",
    empty: "Add commands to build your sequence. The robot will follow them in order!",
    clear: "Clear All",
    remove: "Remove",
  },
  advanced: {
    placeholder: "# Write your commands here, one per line\nmove_forward()\nturn_right()\nmove_forward()\n\n# Repeat a block instead of typing it over and over:\nrepeat(3):\n    move_forward()",
    hint: "Type one command per line. Use move_forward(), turn_left(), turn_right(), move_backward(), or wrap steps in repeat(N): to loop them.",
    run: "Run Code",
    examples: "Examples",
    errorUnknown: "Line {n}: Unknown command \"{cmd}\". Use move_forward(), turn_left(), turn_right(), or move_backward().",
    errorSyntax: "Line {n}: Invalid syntax. Commands must end with parentheses, e.g. move_forward().",
    errorEmpty: "Your code is empty. Add some commands first!",
    errorConditionalNotAllowed: "Line {n}: if/else isn't available yet in Advanced Mode. Switch to Expert Mode to use conditions!",
  },
  expert: {
    placeholder:
      "# You already know repeat(N): from Advanced.\n# Now add if/else with wall_ahead()\nrepeat(3):\n    move_forward()\n\nif wall_ahead():\n    turn_left()\nelse:\n    move_forward()",
    hint:
      "Indent with spaces to build blocks. Use repeat(N): like in Advanced, plus if wall_ahead():, if path_ahead():, and else: to make decisions.",
    run: "Run Code",
    errorUnknown: "Line {n}: Unknown command \"{cmd}\". Use move_forward(), turn_left(), turn_right(), or move_backward().",
    errorSyntax: "Line {n}: Invalid syntax near \"{cmd}\". Check your repeat()/if/else blocks.",
    errorEmpty: "Your code is empty. Add some commands first!",
    errorIndent: "Line {n}: Expected an indented block after ':'.",
  },
  actions: {
    run: "Run",
    reset: "Reset Robot",
    retry: "Try Again",
    replay: "Replay",
    newMaze: "New Maze",
  },
  feedback: {
    running: "Running commands...",
    wall: "Bump! The robot hit a wall. Try a different path!",
    bounds: "The robot tried to go outside the maze!",
    success: "Hooray! The robot collected the star!",
    notReached: "The robot stopped, but it didn't reach the star. Try adding more commands!",
    limit: "The program ran too many steps — check your loops for an endless repeat!",
    runningCmd: "Running: {cmd}",
    idle: "Ready to go! Build your command sequence and press Run.",
  },
  scoring: {
    moves: "Your Moves",
    optimal: "Optimal Moves",
    stars: "Stars Earned",
    threeStar: "Perfect! You found the shortest path!",
    twoStar: "Great job! Just a few extra moves.",
    oneStar: "You made it! Try to find a shorter route next time.",
    result: "Result",
  },
  mazes: {
    title: "Choose a Maze",
    level: "Level",
  },
  concepts: {
    loopTitle: "You just used a loop! 🔁",
    loopBody: "A loop means the robot repeats a step for you — instead of writing move_forward() five times, you can just say \"repeat 5 times\"!",
    conditionalTitle: "You just used a conditional! 🤔",
    conditionalBody: "A conditional means the robot decides what to do based on what it sees — like \"if there's a wall ahead, turn, otherwise keep going\"!",
    close: "Got it!",
  },
  footer: "Robot Maze Quest — Learn logic and programming through play.",
};

const nl: Translation = {
  header: {
    title: "Robot Maze Quest",
    subtitle: "Stuur de robot door het doolhof en pak de ster!",
  },
  mode: {
    easy: "Makkelijke Modus",
    advanced: "Geavanceerde Modus",
    expert: "Expert Modus",
    easyDesc: "Tik op kleurige knoppen om de robot te bewegen — ideaal voor 6 tot 12 jaar.",
    advancedDesc: "Schrijf Python-achtige commando's en gebruik herhaal-lussen om typwerk te besparen — voor 10 jaar en ouder.",
    expertDesc: "Alles uit Geavanceerd, plus if/else-voorwaarden zoals wall_ahead() — voor gevorderde programmeurs.",
  },
  lang: { label: "Taal" },
  tutorial: {
    button: "Uitleg",
    title: "Hoe het werkt",
    start: "Start Spel",
    next: "Volgende",
    back: "Terug",
    skip: "Overslaan",
    close: "Sluiten",
    pages: [
      {
        title: "Welkom!",
        body: "Jouw missie is simpel: stuur de vriendelijke robot door het doolhof naar de glinsterende ster. Bedenk je stappen goed en verdien drie sterren door efficiënt te zijn!",
      },
      {
        title: "Het Doel",
        body: "De robot start op het groene startveld. De ster staat aan het einde van het doolhof. Je moet de robot een reeks commando's geven die hem naar de ster leidt zonder tegen muren aan te botsen.",
      },
      {
        title: "Beweegcommando's",
        body: "Ga Vooruit stuurt de robot één vakje vooruit. Ga Achteruit stuurt hem één vakje achteruit. Draai Links en Draai Rechts draaien de robot op zijn plek — ze bewegen hem niet, maar veranderen de richting waarin hij kijkt.",
      },
      {
        title: "Twee Manieren om te Spelen",
        body: "In de Makkelijke Modus bouw je een commandolijst door op grote kleurige knoppen te tikken — perfect voor jonge kids. In de Geavanceerde Modus typ je Python-achtige commando's zoals move_forward() in een code-editor — ideaal voor tieners die leren programmeren.",
      },
      {
        title: "Sterrenwaardering",
        body: "Je score hangt af van hoe efficiënt je het doolhof oplost. De app berekent de kortst mogelijke route. Drie sterren betekent dat je dit gehaald hebt. Twee sterren betekent een paar stappen extra. Eén ster betekent dat je het gehaald hebt, maar met veel omwegen!",
      },
    ],
  },
  commands: {
    forward: "Ga Vooruit",
    backward: "Ga Achteruit",
    left: "Draai Links",
    right: "Draai Rechts",
    forwardHint: "Beweeg één vakje in de richting van de robot",
    backwardHint: "Beweeg één vakje achteruit",
    leftHint: "Draai de robot 90° naar links",
    rightHint: "Draai de robot 90° naar rechts",
    add: "Toevoegen",
    sequence: "Jouw Commando's",
    empty: "Voeg commando's toe om je reeks te bouwen. De robot voert ze op volgorde uit!",
    clear: "Alles Wissen",
    remove: "Verwijder",
  },
  advanced: {
    placeholder: "# Schrijf je commando's hier, één per regel\nmove_forward()\nturn_right()\nmove_forward()\n\n# Herhaal een blok in plaats van het steeds opnieuw te typen:\nrepeat(3):\n    move_forward()",
    hint: "Typ één commando per regel. Gebruik move_forward(), turn_left(), turn_right(), move_backward(), of zet stappen in repeat(N): om ze te herhalen.",
    run: "Code Uitvoeren",
    examples: "Voorbeelden",
    errorUnknown: "Regel {n}: Onbekend commando \"{cmd}\". Gebruik move_forward(), turn_left(), turn_right(), of move_backward().",
    errorSyntax: "Regel {n}: Ongeldige syntaxis. Commando's moeten eindigen met haakjes, bijv. move_forward().",
    errorEmpty: "Je code is leeg. Voeg eerst wat commando's toe!",
    errorConditionalNotAllowed: "Regel {n}: if/else is nog niet beschikbaar in de Geavanceerde Modus. Ga naar de Expert Modus om voorwaarden te gebruiken!",
  },
  expert: {
    placeholder:
      "# Je kent repeat(N): al uit Geavanceerd.\n# Voeg nu if/else toe met wall_ahead()\nrepeat(3):\n    move_forward()\n\nif wall_ahead():\n    turn_left()\nelse:\n    move_forward()",
    hint:
      "Gebruik spaties om blokken in te springen. Gebruik repeat(N): net als in Geavanceerd, plus if wall_ahead():, if path_ahead():, en else: om keuzes te maken.",
    run: "Code Uitvoeren",
    errorUnknown: "Regel {n}: Onbekend commando \"{cmd}\". Gebruik move_forward(), turn_left(), turn_right(), of move_backward().",
    errorSyntax: "Regel {n}: Ongeldige syntaxis bij \"{cmd}\". Controleer je repeat()/if/else-blokken.",
    errorEmpty: "Je code is leeg. Voeg eerst wat commando's toe!",
    errorIndent: "Regel {n}: Er wordt een ingesprongen blok verwacht na ':'.",
  },
  actions: {
    run: "Uitvoeren",
    reset: "Reset Robot",
    retry: "Opnieuw Proberen",
    replay: "Opnieuw Afspelen",
    newMaze: "Nieuw Doolhof",
  },
  feedback: {
    running: "Commando's uitvoeren...",
    wall: "Botsing! De robot botste tegen een muur. Probeer een andere route!",
    bounds: "De robot probeerde buiten het doolhof te gaan!",
    success: "Hoera! De robot heeft de ster gepakt!",
    notReached: "De robot stopte, maar bereikte de ster niet. Probeer meer commando's toe te voegen!",
    limit: "Het programma deed te veel stappen — controleer je lussen op een oneindige herhaling!",
    runningCmd: "Uitvoeren: {cmd}",
    idle: "Klaar om te gaan! Bouw je commandoreeks en druk op Uitvoeren.",
  },
  scoring: {
    moves: "Jouw Stappen",
    optimal: "Optimale Stappen",
    stars: "Verdiende Sterren",
    threeStar: "Perfect! Je vond de kortste route!",
    twoStar: "Goed gedaan! Slechts een paar stappen extra.",
    oneStar: "Gehaald! Probeer de volgende keer een kortere route te vinden.",
    result: "Resultaat",
  },
  mazes: {
    title: "Kies een Doolhof",
    level: "Level",
  },
  concepts: {
    loopTitle: "Je hebt net een lus gebruikt! 🔁",
    loopBody: "Een lus betekent dat de robot een stap voor je herhaalt — in plaats van vijf keer move_forward() te typen, zeg je gewoon \"herhaal 5 keer\"!",
    conditionalTitle: "Je hebt net een voorwaarde gebruikt! 🤔",
    conditionalBody: "Een voorwaarde betekent dat de robot beslist wat hij doet op basis van wat hij ziet — zoals \"als er een muur voor me is, draai ik, anders ga ik door\"!",
    close: "Begrepen!",
  },
  footer: "Robot Maze Quest — Leer logica en programmeren door te spelen.",
};

export const translations: Record<Lang, Translation> = { en, nl };
