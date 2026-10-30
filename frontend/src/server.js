const apiOrigin = (process.env.REACT_APP_API_ORIGIN || "http://localhost:8000").replace(/\/+$/, "");

export const server = `${apiOrigin}/api/v2`;

export const backend_url = `${apiOrigin}/`;

export const getImageUrl = (image) => {
  if (!image) return "";
  if (/^(https?:)?\/\//i.test(image) || image.startsWith("data:")) return image;
  return `${backend_url}${image.replace(/^\/+/, "")}`;
};
