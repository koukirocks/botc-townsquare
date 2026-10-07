const editionAssets = require.context("../assets/editions", false, /\.png$/);

export const getEditionLogo = (edition) => {
  const id = typeof edition === "string" ? edition : edition && edition.id;
  if (!id) return "";
  const asset = `./${id}.png`;
  return editionAssets.keys().includes(asset)
    ? editionAssets(asset)
    : editionAssets("./custom.png");
};
