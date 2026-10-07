import Vue from "vue";
import Vuex from "vuex";
import persistence from "./persistence";
import socket from "./socket";
import players from "./modules/players";
import session from "./modules/session";
import editionJSON from "../editions.json";
import rolesJSON from "../roles.json";
import fabledJSON from "../fabled.json";
import nightJSON from "../nightsheet.json";

Vue.use(Vuex);

// helper functions
const clean = (id) => id.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");

const getNightOrder = (order, id) => {
  const index = order.indexOf(clean(id));
  return index === -1 ? 0 : index + 1;
};

const rolesWithNightOrder = rolesJSON.map((role) => ({
  ...role,
  firstNight: getNightOrder(nightJSON.firstNight, role.id),
  otherNight: getNightOrder(nightJSON.otherNight, role.id),
}));

const getRolesByEdition = (edition = editionJSON[0]) => {
  return new Map(
    rolesWithNightOrder
      .filter((r) => r.edition === edition.id || edition.roles.includes(r.id))
      .sort((a, b) => b.team.localeCompare(a.team))
      .map((role) => [role.id, role]),
  );
};

const getTravelersNotInEdition = (edition = editionJSON[0]) => {
  return new Map(
    rolesWithNightOrder
      .filter(
        (r) =>
          r.team === "traveler" &&
          r.edition !== edition.id &&
          !edition.roles.includes(r.id),
      )
      .map((role) => [role.id, role]),
  );
};

const set =
  (key) =>
  ({ grimoire }, val) => {
    grimoire[key] = val;
  };

const toggle =
  (key) =>
  ({ grimoire }, val) => {
    if (val === true || val === false) {
      grimoire[key] = val;
    } else {
      grimoire[key] = !grimoire[key];
    }
  };

// global data maps
const editionJSONbyId = new Map(
  editionJSON.map((edition) => [edition.id, edition]),
);
const rolesJSONbyId = new Map(
  rolesWithNightOrder.map((role) => [role.id, role]),
);
const fabled = new Map(fabledJSON.map((role) => [role.id, role]));

const officialJinxesUrl =
  "https://release.botc.app/resources/data/jinxes.json";

// base definition for custom roles
const customRole = {
  id: "",
  name: "",
  image: "",
  ability: "",
  edition: "custom",
  firstNight: 0,
  firstNightReminder: "",
  otherNight: 0,
  otherNightReminder: "",
  reminders: [],
  remindersGlobal: [],
  setup: false,
  team: "townsfolk",
  isCustom: true,
};

const store = new Vuex.Store({
  modules: {
    players,
    session,
  },
  state: {
    grimoire: {
      isNight: false,
      isNightOrder: true,
      isPublic: true,
      isMenuOpen: false,
      isStatic: false,
      isMuted: false,
      zoom: 0,
      background: "",
    },
    modals: {
      edition: false,
      fabled: false,
      gameState: false,
      nightOrder: false,
      playerList: false,
      reference: false,
      reminder: false,
      role: false,
      roles: false,
      tokenShowcase: false,
      voteHistory: false,
    },
    edition: editionJSONbyId.get("tb"),
    roles: getRolesByEdition(),
    otherTravelers: getTravelersNotInEdition(),
    fabled,
    jinxes: new Map(),
  },
  getters: {
    /**
     * Return all custom roles, with default values and non-essential data stripped.
     * Role object keys will be replaced with a numerical index to conserve bandwidth.
     * @param roles
     * @returns {[]}
     */
    customRolesStripped: ({ roles }) => {
      const customRoles = [];
      const customKeys = Object.keys(customRole);
      const strippedProps = [
        "firstNightReminder",
        "otherNightReminder",
        "isCustom",
      ];
      roles.forEach((role) => {
        if (!role.isCustom) {
          customRoles.push({ id: role.id });
        } else {
          const strippedRole = {};
          for (let prop in role) {
            if (strippedProps.includes(prop)) {
              continue;
            }
            const value = role[prop];
            if (customKeys.includes(prop) && value !== customRole[prop]) {
              strippedRole[customKeys.indexOf(prop)] = value;
            }
          }
          customRoles.push(strippedRole);
        }
      });
      return customRoles;
    },
    rolesJSONbyId: () => rolesJSONbyId,
  },
  mutations: {
    setZoom: set("zoom"),
    setJinxes(state, entries) {
      state.jinxes = new Map(
        entries.map(({ id, jinx }) => [
          clean(id),
          new Map(jinx.map(({ id: second, reason }) => [clean(second), reason])),
        ]),
      );
    },
    setBackground: set("background"),
    toggleMuted: toggle("isMuted"),
    toggleMenu: toggle("isMenuOpen"),
    toggleNightOrder: toggle("isNightOrder"),
    toggleStatic: toggle("isStatic"),
    toggleNight: toggle("isNight"),
    toggleGrimoire: toggle("isPublic"),
    toggleModal({ modals }, name) {
      if (name) {
        modals[name] = !modals[name];
      }
      for (let modal in modals) {
        if (modal === name) continue;
        modals[modal] = false;
      }
    },
    /**
     * Store custom roles
     * @param state
     * @param roles Array of role IDs or full role definitions
     */
    setCustomRoles(state, roles) {
      const processedRoles = roles
        // replace numerical role object keys with matching key names
        .map((role) => {
          if (role[0]) {
            const customKeys = Object.keys(customRole);
            const mappedRole = {};
            for (let prop in role) {
              if (customKeys[prop]) {
                mappedRole[customKeys[prop]] = role[prop];
              }
            }
            return mappedRole;
          } else {
            return role;
          }
        })
        // clean up role.id
        .map((role) => {
          role.id = clean(role.id);
          return role;
        })
        // map existing roles to base definition or pre-populate custom roles to ensure all properties
        .map(
          (role) =>
          rolesJSONbyId.get(role.id)
            ? Object.assign({}, rolesJSONbyId.get(role.id), role)
            : state.roles.get(role.id) ||
              Object.assign({}, customRole, role),
        )
        // default empty icons and placeholders, clean up firstNight / otherNight
        .map((role) => {
          if (!rolesJSONbyId.get(role.id)) {
            role.imageAlt = // map team to generic icon
              {
                townsfolk: "good",
                outsider: "outsider",
                minion: "minion",
                demon: "evil",
                fabled: "fabled",
              }[role.team] || "custom";
            role.firstNight = Math.abs(role.firstNight);
            role.otherNight = Math.abs(role.otherNight);
          }
          if (Array.isArray(role.jinxes)) {
            role.jinxes = new Map(
              role.jinxes.map(({ id, reason }) => [clean(id), reason]),
            );
          }
          return role;
        })
        // filter out roles that don't match an existing role and also don't have name/ability/team
        .filter((role) => role.name && role.ability && role.team)
        // sort by team
        .sort((a, b) => b.team.localeCompare(a.team));
      // convert to Map without Fabled
      state.roles = new Map(
        processedRoles
          .filter((role) => role.team !== "fabled")
          .map((role) => [role.id, role]),
      );
      // update Fabled to include custom Fabled from this script
      state.fabled = new Map([
        ...processedRoles
          .filter((r) => r.team === "fabled")
          .map((r) => [r.id, r]),
        ...fabledJSON.map((role) => [role.id, role]),
      ]);
      // update extraTravelers map to only show travelers not in this script
      state.otherTravelers = new Map(
        rolesWithNightOrder
          .filter(
            (r) => r.team === "traveler" && !roles.some((i) => i.id === r.id),
          )
          .map((role) => [role.id, role]),
      );
    },
    setEdition(state, edition) {
      if (editionJSONbyId.has(edition.id)) {
        state.edition = editionJSONbyId.get(edition.id);
        state.roles = getRolesByEdition(state.edition);
        state.otherTravelers = getTravelersNotInEdition(state.edition);
      } else {
        state.edition = edition;
      }
      state.modals.edition = false;
    },
  },
  plugins: [persistence, socket],
});

fetch(officialJinxesUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }
    return response.json();
  })
  .then((entries) => {
    if (!Array.isArray(entries)) {
      throw new Error("Official jinx data must be an array");
    }
    store.commit("setJinxes", entries);
  })
  .catch((error) => {
    console.error("Couldn't load official jinx data", error);
  });

export default store;
