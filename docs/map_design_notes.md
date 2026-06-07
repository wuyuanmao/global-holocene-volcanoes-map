# Global Holocene Volcanoes Web Map

## Purpose and Audience

This web map is designed for students learning introductory cartography and physical geography. The map emphasizes readable patterns instead of exposing every database field at once. Pop-ups use short explanatory notes so students can connect each volcano to form, eruption history, elevation, and tectonic setting.

## Design Changes from the ArcGIS Online Draft

- Replaced the original single-field volcano symbolization with a thematic symbol system.
- Color now represents generalized volcano form.
- Symbol size and opacity now suggest recency of the last known eruption.
- Added a title, sidebar, legend, filters, key statistics, and a data/source note.
- Rewrote pop-ups in student-friendly language with brief definitions and tectonic interpretation prompts.
- Added featured pop-ups with images and short stories for Vesuvius, Eyjafjallajokull, Krakatau, St. Helens, Mauna Loa, Etna, and Fujisan.
- Added a famous-volcano shortcut panel so students can jump directly to volcanoes with image stories.
- Used a quieter light basemap so volcano symbols remain the visual focus.

## Folder Structure

- `index.html`: Main web page.
- `src/styles.css`: Layout, typography, sidebar, legend, popup, and responsive styling.
- `src/app.js`: Leaflet map setup, data loading, filtering, symbol styling, legend generation, and pop-ups.
- `data/volcanoes.geojson`: Cleaned point data generated from the provided Excel file.
- `data/summary.json`: Summary values used by the sidebar.
- `docs/map_design_notes.md`: This design and structure note.
- `start_server.ps1` and `start_server.py`: Local preview server scripts.
- `vendor/leaflet/`: Local copy of the Leaflet web mapping library.
- `assets/images/`: Local images used in selected famous-volcano pop-ups.

## How to Run

Because the page loads local GeoJSON with `fetch`, open it through a local web server rather than double-clicking the HTML file. Leaflet is included locally, but the CARTO basemap tiles still require an internet connection.

From this folder, run:

```powershell
.\start_server.ps1
```

Then open:

```text
http://localhost:8765
```

## Featured Image Sources

- Vesuvius: NASA Earth Observatory, A View of Vesuvius.
- Eyjafjallajokull: NASA/JPL/EO-1 Mission/GSFC/Ashley Davies.
- Krakatau: NASA Earth Observatory, Krakatau Volcano National Park.
- St. Helens: Austin Post, USGS, public domain.
- Mauna Loa: J. D. Griggs, USGS, public domain.
- Etna: NASA, International Space Station image, public domain.
- Fujisan: NASA Earth Observatory / astronaut photograph, public domain.
