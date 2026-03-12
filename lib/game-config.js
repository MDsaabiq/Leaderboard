export const GAMES = {
  droneArena: {
    id: "droneArena",
    priority: 1,
    short: "DRONE ARENA",
    title: "Drone Arena",
    subtitle: "Precision Flight Gauntlet",
    accent: "#00e4ff",
    panel: "#06171f"
  },
  vr: {
    id: "vr",
    priority: 2,
    short: "VR",
    title: "VR Beat Challenge",
    subtitle: "Immersive Reflex Zone",
    accent: "#89ff5b",
    panel: "#131f09"
  },
  robotSoccer: {
    id: "robotSoccer",
    priority: 3,
    short: "ROBOT SOCCER",
    title: "Robot Soccer",
    subtitle: "Autonomous Attack League",
    accent: "#ffa33f",
    panel: "#24180a"
  },
  droneTrack: {
    id: "droneTrack",
    priority: 4,
    short: "DRONE TRACK",
    title: "Drone Time Track",
    subtitle: "Time Trial Circuit",
    accent: "#56a0ff",
    panel: "#08152b"
  },
  iceHockey: {
    id: "iceHockey",
    priority: 5,
    short: "ICE HOCKEY",
    title: "Board Ice Hockey",
    subtitle: "Tabletop Strike Arena",
    accent: "#e0f3ff",
    panel: "#10202d"
  }
};

export const GAME_ORDER = Object.values(GAMES)
  .sort((a, b) => a.priority - b.priority)
  .map((game) => game.id);

export const METRICS = {
  droneArena: ["score", "accuracy", "time", "penalties"],
  vr: ["score", "combo", "hits", "time"],
  robotSoccer: ["score", "wins", "goals", "time"],
  droneTrack: ["score", "laps", "bestLap", "crashes"],
  iceHockey: ["score", "wins", "shots", "time"]
};
