/**
 * Handle a vote request.
 * If the vote is from a seat that is already locked, ignore it.
 * @param state session state
 * @param index seat of the player in the circle
 * @param vote number of votes (0, 1, or 2)
 */
const handleVote = (state, [index, vote]) => {
  if (!state.nomination) return;
  state.votes = [...state.votes];
  state.votes[index] =
    vote === undefined ? Math.abs((state.votes[index] || 0) - 1) : vote;
};

const state = () => ({
  sessionId: "",
  isSpectator: false,
  isReconnecting: false,
  playerCount: 0,
  ping: 0,
  connectedPlayers: [],
  playerId: "",
  playerName: "",
  claimedSeat: -1,
  nomination: false,
  votes: [],
  lockedVote: 0,
  votingSpeed: 3000,
  allowSelfNaming: true,
  isVoteInProgress: false,
  voteHistory: [],
  markedPlayer: -1,
  isVoteHistoryAllowed: true,
  isVoteWatchingAllowed: true,
  isTwoVotesEnabled: false,
  isRolesDistributed: false,
  isSendBluffsWithRoles: false,
  showcaseToken: "",
});

const getters = {};

const actions = {};

// mutations helper functions
const set = (key) => (state, val) => {
  state[key] = val;
};

const mutations = {
  setPlayerId: set("playerId"),
  setPlayerName: set("playerName"),
  setSpectator: set("isSpectator"),
  setReconnecting: set("isReconnecting"),
  setPlayerCount: set("playerCount"),
  setConnectedPlayers: set("connectedPlayers"),
  setPing: set("ping"),
  setVotingSpeed: set("votingSpeed"),
  setAllowSelfNaming: set("allowSelfNaming"),
  setVoteInProgress: set("isVoteInProgress"),
  setMarkedPlayer: set("markedPlayer"),
  setNomination: set("nomination"),
  setVoteHistoryAllowed: set("isVoteHistoryAllowed"),
  setVoteWatchingAllowed: set("isVoteWatchingAllowed"),
  setTwoVotesEnabled: set("isTwoVotesEnabled"),
  setShowcaseToken: set("showcaseToken"),
  claimSeat: set("claimedSeat"),
  setClaimedSeat: set("claimedSeat"),
  distributeRoles: set("isRolesDistributed"),
  setSendBluffsWithRoles: set("isSendBluffsWithRoles"),
  setSessionId(state, sessionId) {
    state.sessionId = sessionId
      .toLocaleLowerCase()
      .replace(/[^0-9a-z]/g, "")
      .substr(0, 10);
  },
  nomination(
    state,
    { nomination, votes, votingSpeed, lockedVote, isVoteInProgress } = {},
  ) {
    state.nomination = nomination || false;
    state.votes = votes || [];
    state.votingSpeed = votingSpeed || state.votingSpeed;
    state.lockedVote = lockedVote || 0;
    state.isVoteInProgress = isVoteInProgress || false;
  },
  /**
   * Create an entry in the vote history log. Requires current player array because it might change later in the game.
   * Only stores votes that were completed.
   * @param state
   * @param players
   */
  addHistory(state, players) {
    if (!state.isVoteHistoryAllowed && state.isSpectator) return;
    if (!state.nomination || state.lockedVote <= players.length) return;
    const isExile =
      players[state.nomination[1]].role.team === "traveler" ||
      players[state.nomination[1]].role.team === "traveller";
    const votes = [];
    for (let index = 0; index < players.length; index++) {
      for (let count = 0; count < (state.votes[index] || 0); count++) {
        votes.push(players[index].name);
      }
    }
    state.voteHistory.push({
      timestamp: new Date(),
      nominator: players[state.nomination[0]].name,
      nominee: players[state.nomination[1]].name,
      type: isExile ? "Exile" : "Execution",
      majority: Math.ceil(
        players.filter((player) => !player.isDead || isExile).length / 2,
      ),
      votes,
    });
  },
  clearVoteHistory(state) {
    state.voteHistory = [];
  },
  /**
   * Store a vote with and without syncing it to the live session.
   * This is necessary in order to prevent infinite voting loops.
   * @param state
   * @param vote
   */
  vote: handleVote,
  voteSync: handleVote,
  lockVote(state, lock) {
    state.lockedVote = lock !== undefined ? lock : state.lockedVote + 1;
  },
  syncSharedGrimOnce() {},
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
