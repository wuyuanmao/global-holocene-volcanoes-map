const DATA_URL = "data/volcanoes.geojson";
const SUMMARY_URL = "data/summary.json";

const typeColors = {
  "Cone volcanoes": "#c5342e",
  "Volcanic fields": "#e0852f",
  "Shield volcanoes": "#2d8f75",
  "Calderas": "#7b4fb0",
  "Complex volcanoes": "#3667a6",
  "Small cones": "#d5a72f",
  "Fissure vents": "#cf4f82",
  "Lava domes": "#6f8f3a",
  "Other or unknown": "#6f7880",
  "Submarine volcanoes": "#287f9e",
  "Ice-covered volcanoes": "#74a7c9"
};

const periodOrder = ["Since 1900", "1500-1899", "1-1499 CE", "BCE record", "Unknown"];
const typeOrder = [
  "Cone volcanoes",
  "Volcanic fields",
  "Shield volcanoes",
  "Calderas",
  "Complex volcanoes",
  "Small cones",
  "Fissure vents",
  "Lava domes",
  "Other or unknown"
];
const tectonicOrder = ["Subduction", "Rift", "Intraplate", "Mid-ocean ridge", "Other setting"];
const popupOptions = {
  className: "volcano-popup",
  autoPan: true,
  keepInView: true,
  maxHeight: 560,
  autoPanPaddingTopLeft: [24, 125],
  autoPanPaddingBottomRight: [285, 36]
};

const featuredVolcanoes = {
  Vesuvius: {
    image: "assets/images/vesuvius.jpg",
    alt: "Satellite view of Mount Vesuvius near Naples and Pompeii",
    credit: "NASA Earth Observatory",
    creditUrl: "https://www.earthobservatory.nasa.gov/images/149298/a-view-of-vesuvius",
    story:
      "Why it is famous: In 79 CE, Vesuvius buried Pompeii and Herculaneum under ash and volcanic material. The disaster preserved streets, houses, and everyday objects, turning the volcano into one of the clearest links between geology and ancient history."
  },
  Eyjafjallajokull: {
    image: "assets/images/eyjafjallajokull.jpg",
    alt: "Satellite view of the Eyjafjallajokull eruption plume in Iceland",
    credit: "NASA/JPL/EO-1 Mission/GSFC/Ashley Davies",
    creditUrl: "https://science.nasa.gov/photojournal/nasa-satellite-eyes-iceland-volcano-cauldron/",
    story:
      "Why it is famous: Its 2010 eruption sent fine ash into busy European air routes. Millions of travelers were affected, making it a modern example of how a remote volcano can disrupt global transportation."
  },
  Krakatau: {
    image: "assets/images/krakatau.jpg",
    alt: "Satellite image of the Krakatau islands in Indonesia",
    credit: "NASA Earth Observatory",
    creditUrl: "https://www.earthobservatory.nasa.gov/images/3844/krakatau-volcano-national-park",
    story:
      "Why it is famous: The 1883 eruption was one of the loudest and most destructive eruptions in recorded history. It generated tsunamis, altered coastlines, and later gave rise to Anak Krakatau, the 'Child of Krakatau.'"
  },
  "St. Helens": {
    image: "assets/images/st-helens.jpg",
    alt: "Large ash plume from the 1980 eruption of Mount St. Helens",
    credit: "Austin Post, USGS",
    creditUrl: "https://commons.wikimedia.org/wiki/File:MSH80_eruption_mount_st_helens_05-18-80-dramatic-edit.jpg",
    story:
      "Why it is famous: In 1980, a landslide and lateral blast removed part of the mountain and devastated the surrounding forest. It became a landmark case for studying volcanic hazards and ecosystem recovery."
  },
  "Mauna Loa": {
    image: "assets/images/mauna-loa.jpg",
    alt: "Mauna Loa volcano in Hawaii",
    credit: "J. D. Griggs, USGS",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Mauna_Loa_Volcano.jpg",
    story:
      "Why it is famous: Mauna Loa is Earth's largest active volcano by volume. Its broad shield shape helps students see how fluid basaltic lava can build a very different landform from steep cone volcanoes."
  },
  Etna: {
    image: "assets/images/etna.jpg",
    alt: "Mount Etna eruption seen from the International Space Station",
    credit: "NASA",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Etna_eruption_seen_from_the_International_Space_Station.jpg",
    story:
      "Why it is famous: Etna is one of the world's most persistently active volcanoes and rises above populated parts of Sicily. It shows how people can live, farm, and monitor hazards around an active volcano."
  },
  Fujisan: {
    displayName: "Mount Fuji",
    image: "assets/images/fujisan.jpg",
    alt: "Mount Fuji viewed from space",
    credit: "NASA Earth Observatory",
    creditUrl: "https://www.earthobservatory.nasa.gov/images/4286/mt-fuji-japan",
    story:
      "Why it is famous: Mount Fuji is Japan's highest mountain and one of the world's most recognizable volcanoes. Its near-perfect cone has appeared in art, literature, pilgrimage routes, and modern tourism, making it both a geological and cultural landmark."
  }
};

const map = L.map("map", {
  center: [14, 8],
  zoom: 2,
  minZoom: 2,
  maxZoom: 8,
  worldCopyJump: true,
  zoomControl: false
});

L.control.zoom({ position: "bottomright" }).addTo(map);

const terrain = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 20
}).addTo(map);

const labels = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
  attribution: "",
  subdomains: "abcd",
  pane: "shadowPane",
  maxZoom: 20
});

let volcanoes = [];
let layerGroup = L.layerGroup().addTo(map);
let selectedMarker = null;
let markerByName = new Map();

const controls = {
  type: document.getElementById("typeFilter"),
  period: document.getElementById("periodFilter"),
  tectonic: document.getElementById("tectonicFilter"),
  search: document.getElementById("countrySearch"),
  reset: document.getElementById("resetFilters"),
  fitWorld: document.getElementById("fitWorld"),
  resultCount: document.getElementById("resultCount"),
  activeHint: document.getElementById("activeHint"),
  typeLegend: document.getElementById("typeLegend"),
  famousList: document.getElementById("famousList")
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function optionList(values, preferredOrder) {
  const set = new Set(values.filter(Boolean));
  const ordered = preferredOrder.filter((item) => set.has(item));
  const rest = [...set].filter((item) => !preferredOrder.includes(item)).sort();
  return [...ordered, ...rest];
}

function addOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function markerRadius(period, elevation) {
  const base = {
    "Since 1900": 7.8,
    "1500-1899": 6.4,
    "1-1499 CE": 5.4,
    "BCE record": 4.6,
    Unknown: 4.2
  }[period] || 4.6;
  const highBoost = Number(elevation) >= 3000 ? 1.1 : 0;
  return base + highBoost;
}

function markerOpacity(period) {
  return {
    "Since 1900": 0.94,
    "1500-1899": 0.78,
    "1-1499 CE": 0.64,
    "BCE record": 0.48,
    Unknown: 0.36
  }[period] || 0.5;
}

function markerStyle(props, isSelected = false) {
  const color = typeColors[props["Type Group"]] || typeColors["Other or unknown"];
  const featured = Boolean(featuredVolcanoes[props["Volcano Name"]]);
  return {
    radius: markerRadius(props["Eruption Period"], props["Elevation (m)"]) + (featured ? 1.8 : 0) + (isSelected ? 3 : 0),
    fillColor: color,
    color: isSelected ? "#111820" : featured ? "#f8d66d" : "#ffffff",
    weight: isSelected ? 2.5 : featured ? 2.2 : 1.4,
    opacity: 1,
    fillOpacity: markerOpacity(props["Eruption Period"])
  };
}

function escapeHtml(value) {
  return String(value ?? "Not listed")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function studentPrompt(props) {
  const setting = props["Tectonic Group"];
  if (setting === "Subduction") {
    return "Student lens: this volcano is linked to a subduction zone, where one plate dives beneath another and magma can rise above it.";
  }
  if (setting === "Rift") {
    return "Student lens: this volcano sits in a rift setting, where the crust is stretching and magma can reach the surface through cracks.";
  }
  if (setting === "Intraplate") {
    return "Student lens: this volcano is away from a major plate boundary, so compare it with hotspot or intraplate examples.";
  }
  return "Student lens: compare this location with nearby volcanoes to infer the larger tectonic pattern.";
}

function featuredPopup(props) {
  const featured = featuredVolcanoes[props["Volcano Name"]];
  if (!featured) return "";
  return `
    <figure class="featured-volcano">
      <img src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.alt)}" loading="lazy" />
      <figcaption>
        Image: <a href="${escapeHtml(featured.creditUrl)}" target="_blank" rel="noopener">${escapeHtml(featured.credit)}</a>
      </figcaption>
    </figure>
    <p class="famous-story">${escapeHtml(featured.story)}</p>
  `;
}

function popupHtml(props) {
  const elevation = props["Elevation (m)"];
  const elevationText = Number.isFinite(Number(elevation)) ? `${formatNumber(Number(elevation))} m` : "Not listed";
  return `
    <article>
      <h3 class="popup-title">${escapeHtml(props["Volcano Name"])}</h3>
      <p class="popup-subtitle">${escapeHtml(props.Country)} - ${escapeHtml(props["Volcanic Region"])}</p>
      ${featuredPopup(props)}
      <dl class="popup-list">
        <div><dt>Form</dt><dd>${escapeHtml(props["Type Group"])}</dd></div>
        <div><dt>Original type</dt><dd>${escapeHtml(props["Primary Volcano Type"])}</dd></div>
        <div><dt>Last eruption</dt><dd>${escapeHtml(props["Last Known Eruption"])} (${escapeHtml(props["Eruption Period"])})</dd></div>
        <div><dt>Elevation</dt><dd>${elevationText}</dd></div>
        <div><dt>Tectonics</dt><dd>${escapeHtml(props["Tectonic Group"])}</dd></div>
        <div><dt>Main rock</dt><dd>${escapeHtml(props["Dominant Rock Type"])}</dd></div>
      </dl>
      <p class="student-note">${escapeHtml(props["Type Description"])} ${escapeHtml(studentPrompt(props))}</p>
    </article>
  `;
}

function matchesFilters(feature) {
  const props = feature.properties;
  const search = controls.search.value.trim().toLowerCase();
  const text = `${props.Country} ${props["Volcano Name"]} ${props["Volcanic Region"]}`.toLowerCase();
  return (
    (controls.type.value === "All" || props["Type Group"] === controls.type.value) &&
    (controls.period.value === "All" || props["Eruption Period"] === controls.period.value) &&
    (controls.tectonic.value === "All" || props["Tectonic Group"] === controls.tectonic.value) &&
    (!search || text.includes(search))
  );
}

function describeFilters(count) {
  const active = [];
  if (controls.type.value !== "All") active.push(controls.type.value);
  if (controls.period.value !== "All") active.push(controls.period.value);
  if (controls.tectonic.value !== "All") active.push(controls.tectonic.value);
  if (controls.search.value.trim()) active.push(`search: ${controls.search.value.trim()}`);
  controls.resultCount.textContent = `${formatNumber(count)} volcano${count === 1 ? "" : "es"} shown`;
  controls.activeHint.textContent = active.length ? active.join(" / ") : "Use filters to compare patterns.";
}

function drawVolcanoes() {
  layerGroup.clearLayers();
  selectedMarker = null;
  markerByName = new Map();
  const filtered = volcanoes.filter(matchesFilters);
  const markers = [];

  filtered.forEach((feature) => {
    const props = feature.properties;
    const [lng, lat] = feature.geometry.coordinates;
    const marker = L.circleMarker([lat, lng], markerStyle(props));
    marker.bindPopup(popupHtml(props), popupOptions);
    marker.on("click", () => {
      if (selectedMarker) {
        selectedMarker.setStyle(markerStyle(selectedMarker.feature.properties));
      }
      selectedMarker = marker;
      marker.setStyle(markerStyle(props, true));
    });
    marker.feature = feature;
    marker.addTo(layerGroup);
    markerByName.set(props["Volcano Name"], marker);
    markers.push(marker);
  });

  describeFilters(filtered.length);
  return markers;
}

function focusFeaturedVolcano(name) {
  controls.type.value = "All";
  controls.period.value = "All";
  controls.tectonic.value = "All";
  controls.search.value = name;
  drawVolcanoes();

  const marker = markerByName.get(name);
  if (!marker) return;
  const props = marker.feature.properties;
  marker.setStyle(markerStyle(props, true));
  selectedMarker = marker;

  map.once("moveend", () => {
    marker.openPopup();
    map.panInside(marker.getLatLng(), {
      paddingTopLeft: [24, 125],
      paddingBottomRight: [285, 36]
    });
  });
  map.flyTo(marker.getLatLng(), 6, { duration: 0.8 });
}

function buildFamousList() {
  controls.famousList.innerHTML = "";
  Object.entries(featuredVolcanoes).forEach(([name, item]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "famous-button";
    button.textContent = item.displayName || name;
    button.addEventListener("click", () => focusFeaturedVolcano(name));
    controls.famousList.appendChild(button);
  });
}

function buildLegend(summary) {
  controls.typeLegend.innerHTML = "";
  typeOrder
    .filter((type) => summary.byType[type])
    .forEach((type) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML = `
        <span class="legend-dot" style="background:${typeColors[type]}"></span>
        <span>${type}</span>
        <span class="legend-count">${formatNumber(summary.byType[type])}</span>
      `;
      controls.typeLegend.appendChild(row);
    });
}

function populateControls(features) {
  addOptions(
    controls.type,
    optionList(
      features.map((feature) => feature.properties["Type Group"]),
      typeOrder
    )
  );
  addOptions(
    controls.period,
    optionList(
      features.map((feature) => feature.properties["Eruption Period"]),
      periodOrder
    )
  );
  addOptions(
    controls.tectonic,
    optionList(
      features.map((feature) => feature.properties["Tectonic Group"]),
      tectonicOrder
    )
  );
}

function fitToFiltered() {
  const markers = drawVolcanoes();
  if (markers.length > 1) {
    const bounds = L.featureGroup(markers).getBounds().pad(0.12);
    map.fitBounds(bounds, { maxZoom: 5 });
  } else if (markers.length === 1) {
    map.setView(markers[0].getLatLng(), 5);
    markers[0].openPopup();
  }
}

function resetFilters() {
  controls.type.value = "All";
  controls.period.value = "All";
  controls.tectonic.value = "All";
  controls.search.value = "";
  drawVolcanoes();
  map.setView([14, 8], 2);
}

async function init() {
  const [geojson, summary] = await Promise.all([
    fetch(DATA_URL).then((response) => response.json()),
    fetch(SUMMARY_URL).then((response) => response.json())
  ]);

  volcanoes = geojson.features;
  document.getElementById("stat-total").textContent = formatNumber(summary.total);
  document.getElementById("stat-countries").textContent = formatNumber(summary.countries);
  document.getElementById("stat-recent").textContent = formatNumber(summary.recent);

  populateControls(volcanoes);
  buildLegend(summary);
  buildFamousList();
  drawVolcanoes();

  controls.type.addEventListener("change", drawVolcanoes);
  controls.period.addEventListener("change", drawVolcanoes);
  controls.tectonic.addEventListener("change", drawVolcanoes);
  controls.search.addEventListener("input", drawVolcanoes);
  controls.reset.addEventListener("click", resetFilters);
  controls.fitWorld.addEventListener("click", fitToFiltered);
}

init().catch((error) => {
  console.error(error);
  controls.resultCount.textContent = "The volcano data could not be loaded.";
  controls.activeHint.textContent = "Check that this folder is served by a local web server.";
});
