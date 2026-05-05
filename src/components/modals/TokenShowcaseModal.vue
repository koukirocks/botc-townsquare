<template>
  <Modal
    class="characters token-showcase-modal"
    v-if="modals.tokenShowcase && availableRoles.length"
    @close="toggleModal('tokenShowcase')"
  >
    <h3>Choose a token to show fullscreen to all players</h3>
    <ul class="tokens">
      <li class="youare" @click="showToken('__youare')">
        <div class="youare-token">YOU ARE</div>
      </li>
      <li class="good" @click="showToken('__good')">
        <div class="youare-token">GOOD</div>
      </li>
      <li class="evil" @click="showToken('__evil')">
        <div class="youare-token">EVIL</div>
      </li>
      <li class="selectedyou" @click="showToken('__selectedyou')">
        <div class="youare-token selectedyou-token">
          <span>SELECTED</span>
          <span>YOU</span>
        </div>
      </li>
      <li
        v-for="role in availableRoles"
        :class="[role.team]"
        :key="role.id"
        @click="showToken(role.id)"
      >
        <Token :role="role" />
      </li>
    </ul>
    <div class="button-group">
      <span class="button" @click="showToken('')">Clear Fullscreen Token</span>
    </div>
  </Modal>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import Token from "../Token";

export default {
  components: { Modal, Token },
  computed: {
    availableRoles() {
      return [...this.roles.values()];
    },
    ...mapState(["modals", "roles", "session"]),
  },
  methods: {
    showToken(roleId) {
      this.$store.commit("session/setShowcaseToken", roleId || "");
    },
    ...mapMutations(["toggleModal"]),
  },
};
</script>

<style scoped lang="scss">
@import "../../vars.scss";

ul.tokens {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 0;
  margin: 0;
}

ul.tokens li {
  border-radius: 50%;
  width: 8vw;
  margin: 1.5%;
  transition: transform 500ms ease;

  &.townsfolk {
    box-shadow:
      0 0 10px $townsfolk,
      0 0 10px #004cff;
  }
  &.outsider {
    box-shadow:
      0 0 10px $outsider,
      0 0 10px $outsider;
  }
  &.minion {
    box-shadow:
      0 0 10px $minion,
      0 0 10px $minion;
  }
  &.demon {
    box-shadow:
      0 0 10px $demon,
      0 0 10px $demon;
  }
  &.traveler {
    box-shadow:
      0 0 10px $traveler,
      0 0 10px $traveler;
  }

  &.youare,
  &.good,
  &.evil,
  &.selectedyou {
    box-shadow:
      0 0 10px $townsfolk,
      0 0 10px #004cff;

    .youare-token {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 3px solid black;
      background: url("../../assets/token.png") center center;
      background-size: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12%;
      font-family: PiratesBay, sans-serif;
      letter-spacing: 1px;
      font-size: clamp(0.8rem, 1.2vw, 1.1rem);
      color: white;
      text-shadow:
        0 1px 1px black,
        0 -1px 1px black,
        1px 0 1px black,
        -1px 0 1px black;
    }
  }

  &.evil {
    box-shadow:
      0 0 10px $demon,
      0 0 10px $demon;
  }

  .selectedyou-token {
    flex-direction: column;
    line-height: 0.92;
    padding: 10%;
    letter-spacing: 0.5px;
    font-size: clamp(0.6rem, 0.95vw, 0.9rem);
  }

  &:hover {
    transform: scale(1.2);
    z-index: 10;
  }
}

.button-group {
  margin-top: 15px;
}

@media screen and (max-width: 1200px) {
  ul.tokens li {
    width: 12vw;
    margin: 1.5%;
  }
}

@media screen and (max-width: 767.98px) {
  ul.tokens {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    padding: 8px 0;
  }

  ul.tokens li {
    width: 100%;
    margin: 0;
  }
}

@media screen and (max-width: 767.98px) and (orientation: landscape) {
  ul.tokens {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }
}

@media screen and (max-width: 575.98px) {
  ul.tokens {
    gap: 6px;
  }

  ul.tokens li {
    width: 100%;
    margin: 0;
  }
}
</style>
