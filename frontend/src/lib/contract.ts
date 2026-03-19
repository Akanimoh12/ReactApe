export const REACT_APE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x6Ff8A142F4909d5ef59C59b28Ccd1184E95F477A";

export const REACT_APE_ABI = [
  { type: "error", name: "ScoreMustBePositive", inputs: [] },
  { type: "error", name: "NameTooLong", inputs: [] },
  { type: "error", name: "NameCannotBeEmpty", inputs: [] },

  {
    type: "event",
    name: "ScoreSubmitted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "NameRegistered",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },

  {
    type: "function",
    name: "submitScore",
    stateMutability: "nonpayable",
    inputs: [{ name: "_score", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "registerName",
    stateMutability: "nonpayable",
    inputs: [{ name: "_name", type: "string" }],
    outputs: [],
  },

  {
    type: "function",
    name: "getLeaderboard",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "player", type: "address" },
          { name: "score", type: "uint256" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getPlayerName",
    stateMutability: "view",
    inputs: [{ name: "_player", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "personalBest",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "hasName",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "playerNames",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "leaderboardCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalScore",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
