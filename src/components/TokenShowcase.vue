<template>
  <transition name="showcase-fade">
    <div class="token-showcase" v-if="shownRole">
      <div
        class="token-wrapper"
        :class="[shownRole.team, { wordtoken: isWordToken }]"
      >
        <div class="word-token" :class="wordTokenCssClass" v-if="isWordToken">
          <span v-for="(line, index) in wordTokenLines" :key="index">{{
            line
          }}</span>
        </div>
        <Token :role="shownRole" v-else />
      </div>
      <button
        class="close"
        @click="clearShowcase"
        title="Hide fullscreen token"
      >
        <font-awesome-icon icon="times-circle" />
      </button>
    </div>
  </transition>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Token from "./Token";

const WORD_TOKENS = {
  __youare: ["YOU", "ARE"],
  __good: ["GOOD"],
  __evil: ["EVIL"],
  __selectedyou: ["SELECTED", "YOU"],
};

const WORD_TOKEN_TEAMS = {
  __youare: "townsfolk",
  __good: "townsfolk",
  __evil: "demon",
  __selectedyou: "townsfolk",
};

export default {
  components: { Token },
  computed: {
    isWordToken() {
      return Object.prototype.hasOwnProperty.call(
        WORD_TOKENS,
        this.session.showcaseToken,
      );
    },
    wordTokenLines() {
      return WORD_TOKENS[this.session.showcaseToken] || [];
    },
    wordTokenCssClass() {
      return {
        selectedyou: this.session.showcaseToken === "__selectedyou",
      };
    },
    shownRole() {
      const roleId = this.session.showcaseToken;
      if (!roleId) return null;
      if (Object.prototype.hasOwnProperty.call(WORD_TOKENS, roleId)) {
        return {
          id: "",
          name: WORD_TOKENS[roleId].join(" "),
          team: WORD_TOKEN_TEAMS[roleId],
          edition: "tb",
        };
      }
      return this.roles.get(roleId) || this.rolesJSONbyId.get(roleId) || null;
    },
    ...mapState(["roles", "session"]),
    ...mapGetters(["rolesJSONbyId"]),
  },
  methods: {
    clearShowcase() {
      this.$store.commit("session/setShowcaseToken", "");
    },
  },
};
</script>

<style scoped lang="scss">
@import "../vars.scss";

.token-showcase {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
}

.token-wrapper {
  width: min(82vw, 82vh);
  max-width: 950px;
  max-height: 950px;
  pointer-events: none;

  &.townsfolk {
    filter: drop-shadow(0 0 35px rgba($townsfolk, 0.85));
  }

  &.outsider {
    filter: drop-shadow(0 0 35px rgba($outsider, 0.85));
  }

  &.minion {
    filter: drop-shadow(0 0 35px rgba($minion, 0.85));
  }

  &.demon {
    filter: drop-shadow(0 0 35px rgba($demon, 0.85));
  }

  &.traveler {
    filter: drop-shadow(0 0 35px rgba($traveler, 0.85));
  }

  &.wordtoken {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.word-token {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid black;
  background: url("../assets/token.png") center center;
  background-size: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.02em;
  text-align: center;
  padding: 6%;
  font-family: PiratesBay, sans-serif;
  letter-spacing: 3px;
  font-size: clamp(4rem, 15vw, 10rem);
  line-height: 0.9;
  color: white;
  text-shadow:
    0 3px 3px black,
    0 -3px 3px black,
    3px 0 3px black,
    -3px 0 3px black;

  span {
    display: block;
  }

  &.selectedyou {
    padding: 8%;
    letter-spacing: 2px;
    font-size: clamp(2.7rem, 10.5vw, 7.4rem);
    line-height: 0.88;
  }
}

button.close {
  position: absolute;
  right: 20px;
  top: 20px;
  background: transparent;
  border: 0;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  opacity: 0.85;

  &:hover {
    opacity: 1;
    color: $demon;
  }
}

.showcase-fade-enter-active,
.showcase-fade-leave-active {
  transition: opacity 180ms ease;
}

.showcase-fade-enter,
.showcase-fade-leave-to {
  opacity: 0;
}
</style>
