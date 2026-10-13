# Where Is My Stop? — Tamil Nadu pilot

A static, installable web app for passengers already aboard a bus. It tracks the passenger's phone and warns as they approach a selected destination. No accounts, database, API keys, or build step are required.

## Try it

Run `npm run dev`, then open `http://localhost:4173`. Real phone use requires hosting over HTTPS; a LAN HTTP address does not support browser geolocation.

1. Tap **Use GPS** or **Enter boarding location manually**. Manual entry lets you choose a mapped stop or city by name, select a map point, or enter latitude and longitude within Tamil Nadu. A city suggestion uses the region centre, so check the map for your exact boarding point. Manual entry is for planning; real journey alerts still request live phone GPS. Tap **Use GPS** to show the boarding location, select the nearest supported city region automatically, and list named stops within 5 km, nearest first. Outside the ten city regions, nearby suggestions still use your exact position across Tamil Nadu. The city region labels use distance from city centres, not administrative district boundaries.
2. Choose **Town / City**, **Express**, **Intercity**, **Deluxe / AC**, or **Other**. These are passenger preferences, not a verified operator route catalogue. They set editable distance presets of 500 m, 1 km, or 2 km.
3. Choose a mapped route with a boarding stop within 1.5 km to see onward destination stops in their source sequence. Check the number, direction, and boarding stop. With no route selected, typing a destination searches all Tamil Nadu, regardless of the displayed map region or the 5 km nearby radius. Common spellings such as Tirupur/Tiruppur and bus stand/busstand match the same place. Exact name matches rank first, then distance from the boarding point. When a route is selected, search stays within its stops; an empty route search offers **Search all Tamil Nadu stops**. Clearing the destination query restores nearby suggestions. **Back to nearby** restores suggestions after browsing a map region. Before location is available, the app waits for GPS or a typed search rather than showing arbitrary stops. English and Tamil search use names available in the source; many stops have no Tamil name.
4. Check the location and road side. Optionally request a road-distance preview.
5. Start the journey after boarding, allow location, test audio, and keep the page visible with the screen on.
6. Acknowledge the alarm, end the journey, and record whether the warning was helpful, early, or late. Export the local ride summaries from **Data & privacy** for pilot evaluation.

The **30-second demo ride** simulates GPS positions without needing location permission. Simulated and real ride summaries are labelled separately.

## Alert behaviour and limits

The default warning is roughly five minutes, adjustable to three or ten minutes. The app estimates time from straight-line distance and measured approach speed over at least three accurate fixes spanning 15 seconds. It also alerts inside the selected distance, including an immediate warning when the ride starts there. Each journey alerts once; repeating sound continues until acknowledged. Notification and vibration availability vary by browser and device.

This is a proximity estimate, not a traffic-aware or route-aware bus ETA. Road bends, intermediate stops, nearby parallel roads, detours, and variable traffic can make the warning early or late. Poor fixes (accuracy over 100 m), stale fixes (over 20 seconds old), duplicates, implausible movement, and invalid coordinates cannot trigger the alarm. If GPS is unavailable, inaccurate, or stale, the journey card shows that live location is unavailable, turns the status amber, and clears live measurements. **Retry GPS** replaces the GPS watch without resetting a delivered alarm; **Return to planning** keeps the destination and re-enables manual planning without recording an incomplete ride. A fresh accurate fix resumes live readings. Manual boarding coordinates never substitute for live tracking.

A screen wake lock is requested where supported, but it does not provide background tracking. Browsers can suspend GPS, audio, timers, or notifications while locked or backgrounded. A native Android implementation and physical-device ride tests are needed before promising reliable pocket alarms.

Mapped route suggestions are static route patterns, not live vehicle locations. Known stop sequences appear as dashed map lines, not road geometry. Older OSM routes without verified order are labelled accordingly and show their mapped stops without an onward-direction claim. Route selection does not change the proximity ETA calculation.

The optional OSRM road preview uses a driving route. It does not identify the passenger's actual bus route and does not change the proximity alarm calculation. Routing failure leaves the straight-line preview and alarm available. The public routing server is suitable for a small pilot; use a hosted provider or your own server before scaling.

## Data provenance

- **Stops:** [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL 1.0, downloaded on 11 October 2026 using the [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API). The bundled `dist/data/stops.json` contains the exact query, source endpoint, source timestamp, retrieval time, license, and per-stop OSM links. Named `highway=bus_stop`, `amenity=bus_station`, and bus platforms inside the Tamil Nadu administrative area are included. Unnamed objects are omitted; coverage is incomplete.
- **Routes:** 3,996 route patterns and 6,092 referenced route stop records from [ChennaiGTFS by UngalSoththu](https://github.com/ungalsoththu/ChennaiGTFS) (3,925 patterns) and OSM bus relations (71 usable routes), downloaded 11 October 2026. The community GTFS feed was collected from the MTC app in April 2026; its README declares ODbL/PDDL for data and the repository includes an MIT notice, preserved in `dist/data/ChennaiGTFS-LICENSE.txt`. The compiled snapshot uses ODbL and includes attribution, source links, and the OSM query. Timetable timestamps and live vehicles are not bundled. Stop records may represent separate platforms or overlap with the OSM stop snapshot; counts are records, not distinct physical stops. Coverage outside Chennai is sparse.
- **State restriction:** [India boundaries by DataMeet India community](https://github.com/datameet/maps/tree/master/States), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Tamil Nadu was extracted from `Admin2.shp`, with exterior and interior rings retained and simplified at a tolerance of 0.00015 degrees. The approximate polygon excludes neighbouring states and Puducherry. One OSM stop outside this boundary was omitted. This polygon is an app eligibility filter, not a legal boundary survey.
- **Maps:** [Leaflet 1.9.4](https://leafletjs.com/) with standard OpenStreetMap tiles and visible attribution. Tiles are requested as needed and are not downloaded in bulk or saved for offline use. Leaflet's license is included in `dist/vendor/Leaflet-LICENSE.txt`.
- **Optional road geometry:** [OSRM Route Service](https://project-osrm.org/docs/v5.24.0/api/#route-service), queried only on user request. The returned driving route is labelled as a preview.

The app does not claim official MTC/TNSTC affiliation, current operating schedules, verified bus category assignments, or live vehicle data. It does not infer a route solely because a road passes near the passenger: a mapped boarding stop must be nearby.

Refresh the stops with `python3 scripts/fetch-stops.py`. The script uses the bundled state boundary, validates coverage, and replaces the dataset atomically. An existing Overpass response may be imported with `--raw /path/to/response.json`. Refreshing requires internet access. After refreshing, run the tests and republish. The downloaded dataset remains usable without a live API during rides.

Refresh routes by downloading the GTFS ZIP linked in `dist/data/routes.json` and requesting the OSM query recorded there, then run `python3 scripts/import-routes.py --gtfs /path/mtc-gtfs.zip --osm /path/routes.json`. The importer filters points to the state boundary, preserves direction and stop order when supplied, and collapses identical timetable patterns. Run checks and republish after importing.

## Privacy and offline use

GPS alert calculations run on the device. Only saved destinations, preferences, and the most recent 20 ride summaries are stored in localStorage. GPS history is not stored and coordinates are not uploaded to our server. The map provider receives the viewed area, and clicking the optional road preview sends current/destination coordinates to OSRM. Sources and these disclosures appear in the app.

A service worker caches the app shell, libraries, stop and route snapshots, and boundary after the first successful online visit. Offline reload and foreground alarms work from that cache. Map tiles, remote fonts, and optional road routing require internet. Installation does not solve the browser's background limitations.

## Verification

`npm test` runs 23 tests covering distance and time triggers, noisy/stale/invalid fixes, stationary/receding motion, one alarm per journey, bus type presets, Tamil search, state restriction, GPS region detection, nearby distance ordering, boarding radius, onward route sequence, route variants, statewide destination matching, spelling variants, manual coordinate validation, and the actual bundled data.

The optional `tests/browser-check.cjs` harness requires Playwright and Chrome/Chromium. Run `node tests/browser-check.cjs` against the local server when these are installed. It checks manual boarding stop selection, coordinate and map entry, statewide Tirupur destination matches despite a Chennai map region, GPS-selected Chennai and Coimbatore, nearby distance ordering, route stop sequence, offline route data, GPS origin, category presets, saved stops, Tamil, road-preview handling with a mocked routing response, simulated and mocked real-location alarms, GPS failure/retry recovery, timeout/poor/stale readings, obsolete watch callbacks, one alarm across retries, return to manual planning, feedback, denied permissions, offline reload, and mobile overflow. These automated checks do not establish GPS or audio reliability on physical phones.

## Source layout

- `dist/` — deployable static application, service worker, data, and local map assets.
- `dist/geo.js` — reusable geography, search, category presets, and tracking engine.
- `dist/app.js` — bilingual UI, GPS integration, map, alarm, local feedback, and optional routing.
- `scripts/fetch-stops.py` — reproducible stop-data refresh.
- `scripts/import-routes.py` — attributed GTFS/OSM route snapshot compilation.
- `tests/` — tracking/data tests and optional browser checks.
- `.openai/hosting.json` — private Sites deployment identity and static directory.
