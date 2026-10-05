<template>
  <Modal v-if="modals.playerList" class="player-list" @close="close">
    <h3>Player list</h3>
    <div class="actions" v-if="session.isSpectator && session.sessionId">
      <div class="button" @click="renameSelf">
        <font-awesome-icon icon="user-edit" /> Rename myself
      </div>
    </div>
    <ul class="list" v-if="session.connectedPlayers.length">
      <li
        v-for="player in session.connectedPlayers"
        :key="player.id"
        :class="{ you: player.id === session.playerId }"
      >
        <span class="seat">
          {{ player.seat >= 0 ? `Seat ${player.seat + 1}` : "Unseated" }}
        </span>
        <span class="name">{{ player.name || "Player" }}</span>
        <span class="meta" v-if="player.id === session.playerId">(You)</span>
        <button
          v-if="!session.isSpectator && player.id !== session.playerId"
          class="sync-grim"
          type="button"
          title="Send this player a one-time grimoire snapshot"
          aria-label="Send this player a one-time grimoire snapshot"
          @click="syncGrimOnce(player.id)"
        >
          <font-awesome-icon icon="book-open" />
        </button>
      </li>
    </ul>
    <p v-else>No players are connected yet.</p>
    <ActionModal
      v-if="renameDialog"
      title="Rename yourself"
      label="Player name"
      :initial-value="renameDialog"
      confirm-text="Save name"
      @submit="saveName"
      @cancel="renameDialog = null"
    />
  </Modal>
</template>

<script>
import { mapState } from "vuex";
import Modal from "./Modal";
import ActionModal from "./ActionModal";

export default {
  components: {
    Modal,
    ActionModal,
  },
  data() {
    return { renameDialog: null };
  },
  computed: {
    ...mapState(["modals", "session"]),
    ...mapState("players", ["players"]),
    seatedPlayer() {
      return this.players.find((player) => player.id === this.session.playerId);
    },
  },
  methods: {
    syncGrimOnce(playerId) {
      this.$store.commit("session/syncSharedGrimOnce", playerId);
    },
    close() {
      this.$store.commit("toggleModal", "playerList");
    },
    renameSelf() {
      if (!this.session.isSpectator) return;
      const fallbackName = this.seatedPlayer ? this.seatedPlayer.name : "";
      const currentName = this.session.playerName || fallbackName || "";
      this.renameDialog = currentName;
    },
    saveName(nextName) {
      const name = nextName.trim();
      if (!name) return;
      this.renameDialog = null;
      this.$store.commit("session/setPlayerName", name);
      if (this.seatedPlayer) {
        this.$store.commit("players/update", {
          player: this.seatedPlayer,
          property: "name",
          value: name,
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../vars.scss";

.actions {
  display: flex;
  justify-content: center;
  margin: 10px 0 15px;
}

.list {
  max-height: 55vh;
  overflow: auto;
}

.list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.list li.you {
  color: $townsfolk;
}

.seat {
  min-width: 85px;
  opacity: 0.8;
}

.name {
  font-weight: 600;
}

.meta {
  opacity: 0.8;
}

.sync-grim {
  margin-left: auto;
  padding: 2px 6px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  cursor: pointer;
  font-size: 0.75em;

  &:hover,
  &:focus-visible {
    color: $townsfolk;
    border-color: $townsfolk;
  }
}
</style>