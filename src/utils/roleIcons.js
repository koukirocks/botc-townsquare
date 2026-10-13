const iconAssets = require.context("../assets/icons", false, /\.png$/);
const availableIcons = new Set(
  iconAssets.keys().map((path) => path.replace("./", "").replace(".png", "")),
);

const onlineIconBase = "https://release.botc.app/resources/characters";

export const hasLocalIcon = (id) => availableIcons.has(id);

export const getOfficialIcon = (role) => {
  const id = typeof role === "string" ? role : role && role.id;
  const team = typeof role === "object" && role ? role.team : "";
  const edition =
    typeof role === "object" && role
      ? role.edition || (team === "fabled" ? "fabled" : "")
      : "";
  if (!id || !edition) return "";
  const resourceEdition = id === "stormcatcher" ? "loric" : edition;
  const alignment =
    team === "townsfolk" || team === "outsider"
      ? "_g"
      : team === "minion" || team === "demon"
        ? "_e"
        : "";
  return `${onlineIconBase}/${resourceEdition}/${id}${alignment}.webp`;
};

export const getLocalIcon = (id) => iconAssets(`./${id}.png`);

export const getRoleIcon = (role) => {
  if (role.image) return role.image;
  const officialIcon = getOfficialIcon(role);
  if (officialIcon) return officialIcon;
  const iconId = role.imageAlt || role.id;
  const fallback = hasLocalIcon(iconId)
    ? iconId
    : {
        townsfolk: "good",
        outsider: "outsider",
        minion: "minion",
        demon: "evil",
        traveler: "custom",
        traveller: "custom",
        fabled: "fabled",
        loric: "custom",
      }[role.team] || "custom";
  return getLocalIcon(fallback);
};
