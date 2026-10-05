<template>
  <div id="controls">
      <div class="toast" v-if="toastMessage" role="status">{{ toastMessage }}</div>
    <span
      class="nomlog-summary"
      v-show="session.voteHistory.length && session.sessionId"
      @click="toggleModal('voteHistory')"
      :title="`${session.voteHistory.length} recent ${
        session.voteHistory.length == 1 ? 'nomination' : 'nominations'
      }`"
    >
      <font-awesome-icon icon="book-dead" />
      {{ session.voteHistory.length }}
    </span>
    <span
      class="session"
      :class="{
        spectator: session.isSpectator,
        reconnecting: session.isReconnecting,
      }"
      v-if="session.sessionId"
      @click="leaveSession"
      :title="`${session.playerCount} other players in this session${
        session.ping ? ' (' + session.ping + 'ms latency)' : ''
      }`"
    >
      <font-awesome-icon icon="broadcast-tower" />
      {{ session.playerCount }}
    </span>
    <div class="menu" :class="{ open: grimoire.isMenuOpen }">
      <font-awesome-icon icon="cog" @click="toggleMenu" />
      <ul>
        <li class="tabs" :class="tab">
          <font-awesome-icon icon="book-open" @click="tab = 'grimoire'" />
          <font-awesome-icon icon="broadcast-tower" @click="tab = 'session'" />
          <font-awesome-icon
            icon="users"
            v-if="!session.isSpectator"
            @click="tab = 'players'"
          />
          <font-awesome-icon icon="theater-masks" @click="tab = 'characters'" />
          <font-awesome-icon icon="question" @click="tab = 'help'" />
        </li>

        <template v-if="tab === 'grimoire'">
          <!-- Grimoire -->
          <li class="headline">Grimoire</li>
          <li @click="toggleGrimoire" v-if="players.length">
            <template v-if="!grimoire.isPublic">Hide</template>
            <template v-if="grimoire.isPublic">Show</template>
            <em>[G]</em>
          </li>
          <li @click="toggleNight" v-if="!session.isSpectator">
            <template v-if="!grimoire.isNight">Switch to Night</template>
            <template v-if="grimoire.isNight">Switch to Day</template>
            <em>[S]</em>
          </li>
          <li @click="toggleNightOrder" v-if="players.length">
            Night order
            <em>
              <font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isNightOrder ? 'check-square' : 'square',
                ]"
              />
            </em>
          </li>
          <li v-if="players.length">
            Zoom
            <em>
              <font-awesome-icon
                @click="setZoom(grimoire.zoom - 1)"
                icon="search-minus"
              />
              {{ Math.round(100 + grimoire.zoom * 10) }}%
              <font-awesome-icon
                @click="setZoom(grimoire.zoom + 1)"
                icon="search-plus"
              />
            </em>
          </li>
          <li @click="setBackground">
            Background image
            <em><font-awesome-icon icon="image" /></em>
          </li>
          <li v-if="!edition.isOfficial" @click="imageOptIn">
            <small>Show Custom Images</small>
            <em
              ><font-awesome-icon
                :icon="[
                  'fas',
                  grimoire.isImageOptIn ? 'check-square' : 'square',
                ]"
            /></em>
          </li>
          <li @click="toggleStatic">
            Disable Animations
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isStatic ? 'check-square' : 'square']"
            /></em>
          </li>
          <li @click="toggleMuted">
            Mute Sounds
            <em
              ><font-awesome-icon
                :icon="['fas', grimoire.isMuted ? 'volume-mute' : 'volume-up']"
            /></em>
          </li>
        </template>

        <template v-if="tab === 'session'">
          <!-- Session -->
          <li class="headline" v-if="session.sessionId">
            {{ session.isSpectator ? "Playing" : "Hosting" }}
          </li>
          <li class="headline" v-else>Live Session</li>
          <template v-if="!session.sessionId">
            <li @click="hostSession">Host (Storyteller)<em>[H]</em></li>
            <li @click="joinSession">Join (Player)<em>[J]</em></li>
          </template>
          <template v-else>
            <li v-if="session.ping">
              Delay to {{ session.isSpectator ? "host" : "players" }}
              <em>{{ session.ping }}ms</em>
            </li>
            <li @click="toggleModal('playerList')">
              Player list
              <em><font-awesome-icon icon="users" /></em>
            </li>
            <li @click="copySessionUrl">
              Copy player link
              <em><font-awesome-icon icon="copy" /></em>
            </li>
            <li v-if="!session.isSpectator" @click="distributeRoles">
              Send Characters
              <em><font-awesome-icon icon="theater-masks" /></em>
            </li>
            <li
              v-if="!session.isSpectator"
              @click="$store.commit('session/setSendBluffsWithRoles', !session.isSendBluffsWithRoles)"
            >
              Include Demon bluffs
              <em>
                <font-awesome-icon
                  :icon="[
                    'fas',
                    session.isSendBluffsWithRoles ? 'check-square' : 'square',
                  ]"
                />
              </em>
            </li>
            <li
              v-if="!session.isSpectator"
              @click="toggleSessionOption('isVoteWatchingAllowed')"
            >
              Show votes to players
              <em>
                <font-awesome-icon
                  :icon="[
                    'fas',
                    session.isVoteWatchingAllowed ? 'check-square' : 'square',
                  ]"
                />
              </em>
            </li>
            <li
              v-if="!session.isSpectator"
              @click="toggleSessionOption('isTwoVotesEnabled')"
            >
              Enable two votes
              <em>
                <font-awesome-icon
                  :icon="[
                    'fas',
                    session.isTwoVotesEnabled ? 'check-square' : 'square',
                  ]"
                />
              </em>
            </li>
            <li
              v-if="!session.isSpectator"
              @click="toggleSessionOption('allowSelfNaming')"
            >
              Allow player renaming
              <em>
                <font-awesome-icon
                  :icon="[
                    'fas',
                    session.allowSelfNaming ? 'check-square' : 'square',
                  ]"
                />
              </em>
            </li>
            <li
              v-if="session.voteHistory.length || !session.isSpectator"
              @click="toggleModal('voteHistory')"
            >
              Vote history<em>[V]</em>
            </li>
            <li @click="leaveSession">
              Leave Session
              <em>{{ session.sessionId }}</em>
            </li>
          </template>
        </template>

        <template v-if="tab === 'players' && !session.isSpectator">
          <!-- Users -->
          <li class="headline">Players</li>
          <li @click="addPlayer" v-if="players.length < 20">Add<em>[A]</em></li>
          <li @click="randomizeSeatings" v-if="players.length > 2">
            Randomize
            <em><font-awesome-icon icon="dice" /></em>
          </li>
          <li @click="clearPlayers" v-if="players.length">
            Remove all
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'characters'">
          <!-- Characters -->
          <li class="headline">Characters</li>
          <li v-if="!session.isSpectator" @click="toggleModal('edition')">
            Select Edition
            <em>[E]</em>
          </li>
          <li
            @click="toggleModal('roles')"
            v-if="!session.isSpectator && players.length > 4"
          >
            Choose & Assign
            <em>[C]</em>
          </li>
          <li v-if="!session.isSpectator" @click="toggleModal('fabled')">
            Add Fabled
            <em><font-awesome-icon icon="dragon" /></em>
          </li>
          <li @click="toggleModal('tokenShowcase')">
            Show Fullscreen Token
            <em>[T]</em>
          </li>
          <li v-if="session.showcaseToken" @click="clearShowcasedToken">
            Clear Fullscreen Token
            <em><font-awesome-icon icon="times-circle" /></em>
          </li>
          <li @click="clearRoles" v-if="players.length">
            Remove all
            <em><font-awesome-icon icon="trash-alt" /></em>
          </li>
        </template>

        <template v-if="tab === 'help'">
          <!-- Help -->
          <li class="headline">Help</li>
          <li @click="toggleModal('reference')">
            Reference Sheet
            <em>[R]</em>
          </li>
          <li @click="toggleModal('nightOrder')">
            Night Order Sheet
            <em>[N]</em>
          </li>
          <li @click="toggleModal('gameState')">
            Game State JSON
            <em><font-awesome-icon icon="file-code" /></em>
          </li>
          <li>
            <a href="https://discord.gg/Gd7ybwWbFk" target="_blank">
              Join Discord
            </a>
            <em>
              <a href="https://discord.gg/Gd7ybwWbFk" target="_blank">
                <font-awesome-icon :icon="['fab', 'discord']" />
              </a>
            </em>
          </li>
          <li>
            <a href="https://github.com/bra1n/townsquare" target="_blank">
              Source code
            </a>
            <em>
              <a href="https://github.com/bra1n/townsquare" target="_blank">
                <font-awesome-icon :icon="['fab', 'github']" />
              </a>
            </em>
          </li>
        </template>
      </ul>
    </div>
    <ActionModal
      v-if="dialog"
      :title="dialog.title"
      :message="dialog.message"
      :label="dialog.label"
      :initial-value="dialog.value"
      :placeholder="dialog.placeholder"
      :confirm-text="dialog.confirmText"
      :input="dialog.input"
      @submit="submitDialog"
      @cancel="closeDialog"
    />
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import ActionModal from "./modals/ActionModal";

export default {
    components: { ActionModal },
  computed: {
    ...mapState(["grimoire", "session", "edition"]),
    ...mapState("players", ["players"]),
  },
  data() {
    return {
      tab: "grimoire",
      dialog: null,
      pendingSessionId: "",
      toastMessage: "",
      toastTimer: null,
    };
  },
  mounted() {
    this.$root.$on("intro-action", this.handleIntroAction);
  },
  beforeDestroy() {
    this.$root.$off("intro-action", this.handleIntroAction);
    clearTimeout(this.toastTimer);
  },
  methods: {
    handleIntroAction(action) {
      this[action]();
    },
    openDialog(dialog) {
      this.dialog = dialog;
    },
    closeDialog() {
      this.dialog = null;
    },
    showToast(message) {
      clearTimeout(this.toastTimer);
      this.toastMessage = message;
      this.toastTimer = setTimeout(() => {
        this.toastMessage = "";
      }, 2500);
    },
    submitDialog(value) {
      const action = this.dialog.action;
      const input = value.trim();
      this.closeDialog();
      if (action === "setBackground") {
        this.$store.commit("setBackground", input);
      } else if (action === "hostSession" && input) {
        this.$store.commit("players/clearSeats");
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", input);
        this.copySessionUrl();
      } else if (action === "joinSessionId" && input) {
        let sessionId = input;
        if (sessionId.match(/^https?:\/\//i)) {
          sessionId = sessionId.split("#").pop();
        }
        if (sessionId) {
          this.pendingSessionId = sessionId;
          this.openDialog({
            action: "joinSessionName",
            title: "Join live session",
            label: "Your player name",
            value: this.session.playerName,
            confirmText: "Join session",
          });
        }
      } else if (action === "joinSessionName" && input) {
        this.$store.commit("session/setPlayerName", input);
        this.$store.commit("session/clearVoteHistory");
        this.$store.commit("session/setSpectator", true);
        this.$store.commit("toggleGrimoire", false);
        this.$store.commit("session/setSessionId", this.pendingSessionId);
        this.pendingSessionId = "";
      } else if (action === "addPlayer" && input) {
        this.$store.commit("players/add", input);
      } else if (action === "imageOptIn") {
        this.toggleImageOptIn();
      } else if (action === "distributeRoles") {
        this.$store.commit("session/distributeRoles", true);
        setTimeout(() => {
          this.$store.commit("session/distributeRoles", false);
        }, 2000);
      } else if (action === "leaveSession") {
        this.$store.commit("players/clearSeats");
        this.$store.commit("session/setSpectator", false);
        this.$store.commit("session/setSessionId", "");
      } else if (action === "randomizeSeatings") {
        this.$store.dispatch("players/randomize");
      } else if (action === "clearPlayers") {
        if (this.session.nomination) this.$store.commit("session/nomination");
        this.$store.commit("players/clear");
      } else if (action === "clearRoles") {
        this.$store.dispatch("players/clearRoles");
      }
    },
    setBackground() {
      this.openDialog({
        action: "setBackground",
        title: "Background image",
        message: "Enter an image or video URL. Leave it empty to restore the default.",
        label: "URL",
        value: this.grimoire.background,
        confirmText: "Save background",
      });
    },
    hostSession() {
      if (this.session.sessionId) return;
      this.openDialog({
        action: "hostSession",
        title: "Host a live session",
        message: "Choose a short channel name or number to share with players.",
        label: "Channel name",
        value: Math.round(Math.random() * 10000).toString(),
        confirmText: "Host session",
      });
    },
    copySessionUrl() {
      const url = window.location.href.split("#")[0];
      const link = url + "#" + this.session.sessionId;
      if (!navigator.clipboard) {
        this.showToast("Clipboard access is unavailable");
        return;
      }
      navigator.clipboard
        .writeText(link)
        .then(() => this.showToast("Player link copied"))
        .catch(() => this.showToast("Could not copy the player link"));
    },
    distributeRoles() {
      if (this.session.isSpectator) return;
      this.openDialog({
        action: "distributeRoles",
        title: "Send characters",
        message: "Assigned characters will be sent to all seated players.",
        confirmText: "Send characters",
        input: false,
      });
    },
    imageOptIn() {
      if (this.grimoire.isImageOptIn) return this.toggleImageOptIn();
      this.openDialog({
        action: "imageOptIn",
        title: "Allow custom images?",
        message: "Custom images can come from untrusted sources and may track your IP address.",
        confirmText: "Allow images",
        input: false,
      });
    },
    joinSession() {
      if (this.session.sessionId) return this.leaveSession();
      this.openDialog({
        action: "joinSessionId",
        title: "Join a live session",
        message: "Paste a channel name or a full player link.",
        label: "Channel or link",
        confirmText: "Continue",
      });
    },
    leaveSession() {
      this.openDialog({
        action: "leaveSession",
        title: "Leave live session?",
        message: "You will be disconnected from the current live game.",
        confirmText: "Leave session",
        input: false,
      });
    },
    addPlayer() {
      if (this.session.isSpectator) return;
      if (this.players.length >= 20) return;
      this.openDialog({
        action: "addPlayer",
        title: "Add player",
        label: "Player name",
        confirmText: "Add player",
      });
    },
    randomizeSeatings() {
      if (this.session.isSpectator) return;
      this.openDialog({
        action: "randomizeSeatings",
        title: "Randomize seatings?",
        message: "The current seating order will be changed.",
        confirmText: "Randomize",
        input: false,
      });
    },
    clearPlayers() {
      if (this.session.isSpectator) return;
      this.openDialog({
        action: "clearPlayers",
        title: "Remove all players?",
        message: "This will clear the entire player list.",
        confirmText: "Remove all",
        input: false,
      });
    },
    clearRoles() {
      this.openDialog({
        action: "clearRoles",
        title: "Remove all roles?",
        message: "All assigned characters and reminders will be cleared.",
        confirmText: "Remove roles",
        input: false,
      });
    },
    clearShowcasedToken() {
      this.$store.commit("session/setShowcaseToken", "");
    },
    toggleSessionOption(option) {
      if (this.session.isSpectator) return;
      this.$store.commit(`session/set${option[0].toUpperCase()}${option.slice(1)}`, !this.session[option]);
    },
    toggleNight() {
      this.$store.commit("toggleNight");
      if (this.grimoire.isNight) {
        this.$store.commit("session/setMarkedPlayer", -1);
      }
    },
    ...mapMutations([
      "toggleGrimoire",
      "toggleMenu",
      "toggleImageOptIn",
      "toggleMuted",
      "toggleNightOrder",
      "toggleStatic",
      "setZoom",
      "toggleModal",
    ]),
  },
};
</script>

<style scoped lang="scss">
@import "../vars.scss";

// success animation
@keyframes greenToWhite {
  from {
    color: green;
  }
  to {
    color: white;
  }
}

// Controls
#controls {
  position: absolute;
  right: 3px;
  top: 3px;
  text-align: right;
  padding-right: 50px;
  z-index: 75;

  .toast {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 14px;
    border: 2px solid black;
    border-radius: 6px;
    background: rgba(0, 80, 30, 0.9);
    box-shadow: 0 2px 8px black;
    white-space: nowrap;
    z-index: 200;
  }

  svg {
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1));
    &.success {
      animation: greenToWhite 1s normal forwards;
      animation-iteration-count: 1;
    }
  }

  > span {
    display: inline-block;
    cursor: pointer;
    z-index: 5;
    margin-top: 7px;
    margin-left: 10px;
  }

  span.nomlog-summary {
    color: $townsfolk;
  }

  span.session {
    color: $demon;
    &.spectator {
      color: $townsfolk;
    }
    &.reconnecting {
      animation: blink 1s infinite;
    }
  }
}

@keyframes blink {
  50% {
    opacity: 0.5;
    color: gray;
  }
}

.menu {
  width: 220px;
  transform-origin: 200px 22px;
  transition: transform 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: rotate(-90deg);
  position: absolute;
  right: 0;
  top: 0;

  &.open {
    transform: rotate(0deg);
  }

  > svg {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    width: 40px;
    height: 50px;
    margin-bottom: -8px;
    border-bottom: 0;
    border-radius: 10px 10px 0 0;
    padding: 5px 5px 15px;
  }

  a {
    color: white;
    text-decoration: none;
    &:hover {
      color: red;
    }
  }

  ul {
    display: flex;
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
    border-radius: 10px 0 10px 10px;

    li {
      padding: 2px 5px;
      color: white;
      text-align: left;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 30px;

      &.tabs {
        display: flex;
        padding: 0;
        svg {
          flex-grow: 1;
          flex-shrink: 0;
          height: 35px;
          border-bottom: 3px solid black;
          border-right: 3px solid black;
          padding: 5px 0;
          cursor: pointer;
          transition: color 250ms;
          &:hover {
            color: red;
          }
          &:last-child {
            border-right: 0;
          }
        }
        &.grimoire .fa-book-open,
        &.players .fa-users,
        &.characters .fa-theater-masks,
        &.session .fa-broadcast-tower,
        &.help .fa-question {
          background: linear-gradient(
            to bottom,
            $townsfolk 0%,
            rgba(0, 0, 0, 0.5) 100%
          );
        }
      }

      &:not(.headline):not(.tabs):hover {
        cursor: pointer;
        color: red;
      }

      em {
        flex-grow: 0;
        font-style: normal;
        margin-left: 10px;
        font-size: 80%;
      }
    }

    .headline {
      font-family: PiratesBay, sans-serif;
      letter-spacing: 1px;
      padding: 0 10px;
      text-align: center;
      justify-content: center;
      background: linear-gradient(
        to right,
        $townsfolk 0%,
        rgba(0, 0, 0, 0.5) 20%,
        rgba(0, 0, 0, 0.5) 80%,
        $demon 100%
      );
    }
  }
}
</style>
