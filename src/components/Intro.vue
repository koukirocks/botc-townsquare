<template>
  <div class="intro">
    <img src="static/apple-icon.png" alt="" class="logo" />
    <div>
      Welcome to the (unofficial)
      <b>Virtual Town Square and Grimoire</b> for Blood on the Clocktower!
      <div class="quick-actions">
        <span class="button" @click="addPlayer">
          <font-awesome-icon icon="user" /> Add player
        </span>
        <span class="button townsfolk" @click="hostSession">
          <font-awesome-icon icon="broadcast-tower" /> Host game
        </span>
        <span class="button demon" @click="joinSession">
          <font-awesome-icon icon="link" /> Join game
        </span>
      </div>
      <small>More tools are available from the menu.</small>
      <div class="footer">
        This project is free and open source and can be found on
        <a href="https://github.com/bra1n/townsquare" target="_blank">GitHub</a
        >. It is not affiliated with The Pandemonium Institute. "Blood on the
        Clocktower" is a trademark of Steven Medway and The Pandemonium
        Institute.
      </div>
    </div>
    <a
      class="redirect"
      v-if="language === 'zh-CN'"
      href="https://clocktower.gstonegames.com"
    >
      <img src="../assets/gstone.png" class="gstone" alt="" />
      你想使用中文版魔典吗？
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      language: window.navigator.userLanguage || window.navigator.language,
    };
  },
  methods: {
    emitAction(action) {
      this.$root.$emit("intro-action", action);
    },
    addPlayer() {
      this.emitAction("addPlayer");
    },
    hostSession() {
      this.emitAction("hostSession");
    },
    joinSession() {
      this.emitAction("joinSession");
    },
  },
};
</script>

<style scoped lang="scss">
// Intro
.intro {
  text-align: center;
  width: 50%;
  font-size: 120%;
  position: absolute;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid black;
  border-radius: 10px;
  z-index: 3;
  display: flex;
  justify-content: center;
  a {
    color: white;
  }
  a.redirect {
    display: block;
    text-decoration: none;
    position: absolute;
    top: 100%;
    margin-top: 2vh;
    padding: 10px;
    background: rgba(0, 0, 0, 0.5);
    border: 3px solid black;
    border-radius: 10px;

    &:hover {
      color: red;
    }
    img {
      width: 120px;
      display: block;
      margin: auto;
      margin-bottom: 1vh;
    }
  }

  img.logo {
    position: absolute;
    bottom: 100%;
    width: 25vh;
    margin-bottom: 2vh;
    max-width: 192px;
    border-radius: 50%;
    box-shadow: 0 0 10px black;
    border: 3px solid black;
  }
  .footer {
    font-size: 60%;
    opacity: 0.75;
  }

  small {
    display: block;
    margin-top: 8px;
    opacity: 0.8;
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin: 12px 0 4px;

    .button {
      margin: 0;
      padding: 0 8px;
    }
  }
}

@media screen and (max-width: 575.98px) {
  .intro {
    width: calc(100% - 24px);
    font-size: 100%;
  }
}
</style>
