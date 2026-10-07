<template>
  <Modal
    v-if="modals.reminder && availableReminders.length && players[playerIndex]"
    @close="toggleModal('reminder')"
  >
    <h3>Choose a reminder token:</h3>
    <ul class="reminders">
      <li
        v-for="reminder in availableReminders"
        class="reminder"
        :class="[reminder.role]"
        :key="reminder.role + ' ' + reminder.name"
        @click="addReminder(reminder)"
      >
        <span
          class="icon"
          :style="{
            backgroundImage: `url(${
              reminder.image
                ? reminder.image
                : require(
                    '../../assets/icons/' +
                      (reminder.imageAlt || reminder.role) +
                      '.png',
                  )
            })`,
          }"
        ></span>
        <span class="text">{{ reminder.name }}</span>
      </li>
    </ul>
    <ActionModal
      v-if="customReminderDialog"
      title="Custom reminder"
      label="Reminder text"
      confirm-text="Add reminder"
      @submit="addCustomReminder"
      @cancel="customReminderDialog = false"
    />
  </Modal>
</template>

<script>
import Modal from "./Modal";
import ActionModal from "./ActionModal";
import { mapMutations, mapState } from "vuex";

/**
 * Helper function that maps a reminder name with a role-based object that provides necessary visual data.
 * @param role The role for which the reminder should be generated
 * @return {function(*): {image: string|string[]|string|*, role: *, name: *, imageAlt: string|*}}
 */
const mapReminder =
  ({ id, image, imageAlt }) =>
  (name) => ({
    role: id,
    image,
    imageAlt,
    name,
  });

export default {
  components: { Modal, ActionModal },
  data() {
    return { customReminderDialog: false };
  },
  props: ["playerIndex"],
  computed: {
    availableReminders() {
      let reminders = [];
      const { players, bluffs } = this.$store.state.players;
      this.$store.state.roles.forEach((role) => {
        // add reminders from player roles
        if (players.some((p) => p.role.id === role.id)) {
          reminders = [...reminders, ...role.reminders.map(mapReminder(role))];
        }
        // add reminders from bluff/other roles
        else if (bluffs.some((bluff) => bluff.id === role.id)) {
          reminders = [...reminders, ...role.reminders.map(mapReminder(role))];
        }
        // add global reminders
        if (role.remindersGlobal && role.remindersGlobal.length) {
          reminders = [
            ...reminders,
            ...role.remindersGlobal.map(mapReminder(role)),
          ];
        }
      });
      // add fabled reminders
      this.$store.state.players.fabled.forEach((role) => {
        reminders = [...reminders, ...role.reminders.map(mapReminder(role))];
      });

      // add out of script traveler reminders
      this.$store.state.otherTravelers.forEach((role) => {
        if (players.some((p) => p.role.id === role.id)) {
          reminders = [...reminders, ...role.reminders.map(mapReminder(role))];
        }
      });

      reminders.push({ role: "good", name: "Good" });
      reminders.push({ role: "evil", name: "Evil" });
      reminders.push({ role: "custom", name: "Custom note" });
      return reminders;
    },
    ...mapState(["modals", "grimoire"]),
    ...mapState("players", ["players"]),
  },
  methods: {
    addReminder(reminder) {
      const player = this.$store.state.players.players[this.playerIndex];
      let value;
      if (reminder.role === "custom") {
        this.customReminderDialog = true;
        return;
      } else {
        value = [...player.reminders, reminder];
      }
      this.$store.commit("players/update", {
        player,
        property: "reminders",
        value,
      });
      this.$store.commit("toggleModal", "reminder");
    },
    addCustomReminder(name) {
      if (!name.trim()) return;
      const player = this.$store.state.players.players[this.playerIndex];
      this.$store.commit("players/update", {
        player,
        property: "reminders",
        value: [...player.reminders, { role: "custom", name: name.trim() }],
      });
      this.customReminderDialog = false;
      this.$store.commit("toggleModal", "reminder");
    },
    ...mapMutations(["toggleModal"]),
  },
};
</script>

<style scoped lang="scss">
ul.reminders .reminder {
  background: url("../../assets/reminder.png") center center;
  background-size: 100%;
  width: 14vh;
  height: 14vh;
  max-width: 100px;
  max-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1%;

  border-radius: 50%;
  border: 3px solid black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  line-height: 100%;
  transition: transform 500ms ease;

  .icon {
    position: absolute;
    top: 0;
    width: 90%;
    height: 90%;
    background-size: 100%;
    background-position: center center;
    background-repeat: no-repeat;
  }

  .text {
    color: black;
    font-size: 65%;
    font-weight: bold;
    text-align: center;
    top: 28%;
    width: 80%;
    line-height: 1;
  }

  &:hover {
    transform: scale(1.2);
  }
}

@media screen and (max-width: 767.98px) {
  ul.reminders {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  ul.reminders .reminder {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    max-width: 84px;
    max-height: none;
    min-width: 0;
    min-height: 0;
    margin: 0;

    .text {
      font-size: 62%;
    }
  }
}

@media screen and (max-width: 767.98px) and (orientation: landscape) {
  ul.reminders {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }

  ul.reminders .reminder {
    max-width: 68px;
  }
}

@media screen and (max-width: 575.98px) {
  ul.reminders {
    gap: 6px;
  }

  ul.reminders .reminder {
    width: 100%;
  }
}
</style>
