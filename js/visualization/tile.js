import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

function getNetWorthClass(netWorth) {
  if (netWorth < 100_000) {
    return "net-worth-red";
  }

  if (netWorth > 200_000) {
    return "net-worth-green";
  }

  return "net-worth-orange";
}

function formatNetWorth(netWorth) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(netWorth);
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function isValidPhotoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function createTile(record, index) {
  const element = document.createElement("div");

  element.className = `periodic-tile ${getNetWorthClass(record.netWorth)}`;

  element.appendChild(
    createTextElement("span", "tile-number", String(index + 1)),
  );

  if (record.photo && isValidPhotoUrl(record.photo)) {
    const image = document.createElement("img");

    image.className = "tile-photo";
    image.src = record.photo;
    image.alt = `${record.name}'s photo`;
    image.loading = "lazy";

    element.appendChild(image);
  }

  element.appendChild(createTextElement("h3", "tile-name", record.name));

  element.appendChild(
    createTextElement(
      "p",
      "tile-detail",
      [record.age !== null ? `${record.age} years` : null, record.country]
        .filter(Boolean)
        .join(" · "),
    ),
  );

  element.appendChild(
    createTextElement("p", "tile-interest", record.interest || "No interest"),
  );

  element.appendChild(
    createTextElement("p", "tile-net-worth", formatNetWorth(record.netWorth)),
  );

  return new CSS3DObject(element);
}
