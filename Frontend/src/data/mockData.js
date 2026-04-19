export const MOCK_ELECTIONS = [
  {
    id: 1,
    name: "Presidential Election 2026",
    description: "National presidential election for the term 2026-2031",
    endTime: "2026-04-15T18:00:00",
    candidates: ["Alice Johnson", "Bob Martinez", "Carol Zhang", "David Patel"],
    votes: { "Alice Johnson": 142, "Bob Martinez": 98, "Carol Zhang": 201, "David Patel": 76 },
    status: "active",
  },
  {
    id: 2,
    name: "Municipal Council Vote",
    description: "City council election for Ward 7",
    endTime: "2026-04-20T20:00:00",
    candidates: ["Emma Wilson", "Frank Lee", "Grace Kim"],
    votes: { "Emma Wilson": 55, "Frank Lee": 89, "Grace Kim": 43 },
    status: "active",
  },
  {
    id: 3,
    name: "Student Union President",
    description: "Annual student union presidential election",
    endTime: "2026-03-20T17:00:00",
    candidates: ["Henry Brown", "Isla Davis"],
    votes: { "Henry Brown": 320, "Isla Davis": 280 },
    status: "ended",
  },
];

export const MOCK_LEDGER = [
  { index: 1, hash: "0x7f3a...b291", candidate: "Carol Zhang", timestamp: "2026-03-27 09:14:22", block: "#00a1f3" },
  { index: 2, hash: "0x2c8e...d047", candidate: "Alice Johnson", timestamp: "2026-03-27 09:18:45", block: "#00a1f3" },
  { index: 3, hash: "0x9b1d...e563", candidate: "Bob Martinez", timestamp: "2026-03-27 09:22:11", block: "#00b4aa" },
  { index: 4, hash: "0x4f7c...a129", candidate: "Carol Zhang", timestamp: "2026-03-27 09:31:07", block: "#00b4aa" },
  { index: 5, hash: "0x1e6b...c884", candidate: "David Patel", timestamp: "2026-03-27 09:40:53", block: "#0070d2" },
];