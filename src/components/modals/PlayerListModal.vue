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
        <label v-if="!session.isSpectator && player.id !== session.playerId" class="share-grim" style="margin-left:auto; cursor:pointer;">
          <input type="checkbox" :checked="session.sharedGrimViewers && session.sharedGrimViewers.includes(player.id)" @change="toggleSharedViewer(player.id)" />
          <span style="font-size:0.8em; margin-left: 4px;">Share Grim</span>
        </label>
      </li>
    </ul>
    <p v-else>No players are connected yet.</p>
  </Modal>
</template>

<script>
import { mapState } from "vuex";
import Modal from "./Modal";

export default {
  components: {
    Modal,
  },
  computed: {
    ...mapState(["modals", "session"]),
    ...mapState("players", ["players"]),
    seatedPlayer() {
      return this.players.find((player) => player.id === this.session.playerId);
    },
  },
  methods: {
    toggleSharedViewer(playerId) {
      this.$store.commit("session/toggleSharedGrimViewer", playerId);
    },
    close() {
      this.$store.commit("toggleModal", "playerList");
    },
    renameSelf() {
      if (!this.session.isSpectator) return;
      const fallbackName = this.seatedPlayer ? this.seatedPlayer.name : "";
      const currentName = this.session.playerName || fallbackName || "";
      const nextName = prompt("Player name", currentName);
      if (nextName === null) return;
      const name = nextName.trim();
      if (!name) return;
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
</style>