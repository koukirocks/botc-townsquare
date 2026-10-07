const iconAssets = require.context("../assets/icons", false, /\.png$/);
const availableIcons = new Set(
  iconAssets.keys().map((path) => path.replace("./", "").replace(".png", "")),
);

const onlineIconBase = "https://release.botc.app/resources/characters";

export const hasLocalIcon = (id) => availableIcons.has(id);

export const getOfficialIcon = (role) => {
  const id = typeof role === "string" ? role : role && role.id;
  const edition = typeof role === "object" && role ? role.edition : "";
  const team = typeof role === "object" && role ? role.team : "";
  if (!id || !edition) return "";
  const alignment =
    team === "townsfolk" || team === "outsider"
      ? "_g"
      : team === "minion" || team === "demon"
        ? "_e"
        : "";
  return `${onlineIconBase}/${edition}/${id}${alignment}.webp`;
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
      }[role.team] || "custom";
  return getLocalIcon(fallback);
};
