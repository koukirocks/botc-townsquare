<template>
  <Modal class="editions" v-if="modals.edition" @close="toggleModal('edition')">
    <div v-if="!isCustom">
      <h3>Select an edition:</h3>
      <ul class="editions">
        <li
          v-for="edition in editions"
          class="edition"
          :class="['edition-' + edition.id]"
          :style="{
            backgroundImage: `url(${getEditionLogo(edition)})`,
          }"
          :key="edition.id"
          @click="setEdition(edition)"
        >
          {{ edition.name }}
        </li>
        <li
          class="edition edition-custom"
          @click="isCustom = true"
          :style="{
            backgroundImage: `url(${getEditionLogo('custom')})`,
          }"
        >
          Custom Script / Characters
        </li>
      </ul>
    </div>
    <div class="custom" v-else>
      <h3>Load custom script / characters</h3>
      To play with a custom script, you need to select the characters you want
      to play with in the official
      <a href="https://script.bloodontheclocktower.com/" target="_blank"
        >Script Tool</a
      >
      and then upload the generated "custom-list.json" either directly here or
      provide a URL to such a hosted JSON file.<br />
      <br />
      To play with custom characters, please read
      <a
        href="https://github.com/nicholas-eden/townsquare#custom-character-support"
        target="_blank"
        >the documentation</a
      >
      on how to write a custom character definition file.
      <b>Only load custom JSON files from sources that you trust!</b>
      <template v-for="(scripts, group) in customScripts">
        <h3 :key="`${group}-title`">
          {{
            group === "teensyville" ? "Teensyville scripts" : "Standard scripts"
          }}
        </h3>
        <ul class="scripts" :key="group">
          <li
            v-for="(script, index) in scripts"
            :key="index"
            @click="loadBundledScript(script)"
          >
            {{ scriptLabel(script) }}
          </li>
        </ul>
      </template>
      <input
        type="file"
        ref="upload"
        accept="application/json"
        @change="handleUpload"
      />
      <div class="button-group">
        <div class="button" @click="openUpload">
          <font-awesome-icon icon="file-upload" /> Upload JSON
        </div>
        <div class="button" @click="promptURL">
          <font-awesome-icon icon="link" /> Enter URL
        </div>
        <div class="button" @click="readFromClipboard">
          <font-awesome-icon icon="clipboard" /> Use JSON from Clipboard
        </div>
        <div class="button" @click="isCustom = false">
          <font-awesome-icon icon="undo" /> Back
        </div>
      </div>
      <ActionModal
        v-if="urlDialog"
        title="Load custom script"
        message="Enter the URL of a custom-script.json file."
        label="Script URL"
        confirm-text="Load script"
        @submit="loadURL"
        @cancel="urlDialog = false"
      />
    </div>
  </Modal>
</template>

<script>
import editionJSON from "../../editions";
import customScripts from "../../customs.json";
import { getOfficialIcon } from "../../utils/roleIcons";
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import { getEditionLogo } from "../../utils/editionIcons";
import ActionModal from "./ActionModal";

export default {
  components: {
    Modal,
    ActionModal,
  },
  data: function () {
    return {
      editions: editionJSON,
      isCustom: false,
      customScripts,
      urlDialog: false,
    };
  },
  computed: mapState(["modals"]),
  methods: {
    getEditionLogo,
    openUpload() {
      this.$refs.upload.click();
    },
    handleUpload() {
      const file = this.$refs.upload.files[0];
      if (file && file.size) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          try {
            const roles = JSON.parse(reader.result);
            this.parseRoles(roles);
          } catch (e) {
            alert("Error reading custom script: " + e.message);
          }
          this.$refs.upload.value = "";
        });
        reader.readAsText(file);
      }
    },
    promptURL() {
      this.urlDialog = true;
    },
    loadURL(url) {
      this.urlDialog = false;
      if (url.trim()) this.handleURL(url.trim());
    },
    scriptLabel(script) {
      const meta = script.find((role) => role && role.id === "_meta") || {};
      return meta.author ? `${meta.name} by ${meta.author}` : meta.name;
    },
    loadBundledScript(script) {
      this.parseRoles(script);
    },
    async handleURL(url) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        this.parseRoles(await res.json());
      } catch (e) {
        alert("Error loading custom script: " + e.message);
      }
    },
    async readFromClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        const roles = JSON.parse(text);
        this.parseRoles(roles);
      } catch (e) {
        alert("Error reading custom script: " + e.message);
      }
    },
    parseRoles(input) {
      if (!Array.isArray(input) || input.length < 5 || input.length > 201) {
        alert("Custom script must contain between 5 and 201 entries.");
        return;
      }
      const metaEntry = input.find(
        (role) => role && typeof role === "object" && role.id === "_meta",
      );
      if (!metaEntry || typeof metaEntry.name !== "string" || !metaEntry.name) {
        alert("Custom script metadata must include an _meta entry with a name.");
        return;
      }
      let roles;
      try {
        roles = input
          .filter((role) => role !== metaEntry)
          .map((role) => {
          if (typeof role === "string") {
            return { id: role.toLocaleLowerCase() };
          }
          if (!role || typeof role !== "object" || Array.isArray(role)) {
            throw new Error("Each script entry must be a role ID or character object.");
          }
          if (
            typeof role.id === "string" &&
            role.id &&
            Object.keys(role).length === 1
          ) {
            return { id: role.id.toLocaleLowerCase() };
          }
          if (
            typeof role.id !== "string" ||
            !role.id ||
            !/^[a-z0-9]+$/.test(role.id.toLocaleLowerCase()) ||
            (role.id !== "_meta" &&
              (!role.name ||
                !role.team ||
                ![
                  "townsfolk",
                  "outsider",
                  "minion",
                  "demon",
                  "traveller",
                  "fabled",
                  "loric",
                ].includes(role.team) ||
                !role.ability))
          ) {
            throw new Error(
              "Custom character objects require id, name, team, and ability.",
            );
          }
          return { ...role, id: role.id.toLocaleLowerCase() };
          })
          .map((normalizedRole) => {
            if (normalizedRole.id && normalizedRole.id !== "_meta") {
              const definition = this.$store.getters.rolesJSONbyId.get(
                normalizedRole.id,
              );
              if (
                !definition &&
                (!normalizedRole.name ||
                  !normalizedRole.team ||
                  !normalizedRole.ability)
              ) {
                throw new Error(`Unknown role ID: ${normalizedRole.id}`);
              }
              const icon = getOfficialIcon(
                Object.assign({}, definition, normalizedRole),
              );
              if (icon && !normalizedRole.image) normalizedRole.image = icon;
            }
            return normalizedRole;
          });
      } catch (error) {
        alert(`Error loading custom script: ${error.message}`);
        return;
      }
      let meta = { ...metaEntry };
      if (
        meta.bootlegger !== undefined &&
        (!Array.isArray(meta.bootlegger) ||
          meta.bootlegger.some((rule) => typeof rule !== "string"))
      ) {
        alert("Script metadata bootlegger must be an array of rule strings.");
        return;
      }
      if (Array.isArray(meta.firstNight)) {
        meta.firstNight = meta.firstNight.map((id) =>
          String(id)
            .toLocaleLowerCase()
            .replace(/[^0-9a-z]/g, ""),
        );
      }
      if (Array.isArray(meta.otherNight)) {
        meta.otherNight = meta.otherNight.map((id) =>
          String(id)
            .toLocaleLowerCase()
            .replace(/[^0-9a-z]/g, ""),
        );
      }
      const customRules = Array.isArray(meta.bootlegger)
        ? meta.bootlegger.filter(Boolean)
        : meta.bootlegger
          ? [String(meta.bootlegger)]
          : [];
      if (customRules.length) {
        if (!roles.some((role) => role.id === "bootlegger")) {
          roles.push({ id: "bootlegger" });
        }
      }
      this.$store.commit("setCustomRoles", roles);
      this.$store.commit(
        "setEdition",
        Object.assign({}, meta, { id: "custom" }),
      );
      if (meta.background) {
        this.$store.commit("setBackground", meta.background);
      }
      const fabled = roles
        .map((role) => this.$store.state.fabled.get(role.id || role))
        .filter(Boolean);
      this.$store.commit("players/setFabled", { fabled });
      this.isCustom = false;
    },
    ...mapMutations(["toggleModal", "setEdition"]),
  },
};
</script>

<style scoped lang="scss">
ul.editions .edition {
  font-family: PiratesBay, sans-serif;
  letter-spacing: 1px;
  text-align: center;
  padding-top: 15%;
  background-position: center center;
  background-size: 100% auto;
  background-repeat: no-repeat;
  width: 30%;
  margin: 5px;
  font-size: 120%;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 5px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  &:hover {
    color: red;
  }
}

.custom {
  text-align: center;
  input[type="file"] {
    display: none;
  }
  .scripts {
    list-style-type: disc;
    font-size: 120%;
    cursor: pointer;
    display: block;
    width: 50%;
    text-align: left;
    margin: 10px auto;
    li:hover {
      color: red;
    }
  }
}

@media screen and (max-width: 767.98px) {
  ul.editions .edition {
    width: 46%;
    margin: 6px 2%;
    font-size: 110%;
  }

  .custom .scripts {
    width: 88%;
    font-size: 105%;
  }
}

@media screen and (max-width: 575.98px) {
  ul.editions .edition {
    width: 78%;
    margin: 6px auto;
    font-size: 105%;
  }
}
</style>
