# whereismybus

Where Is My Stop? — a Tamil Nadu bus-stop alert pilot. Choose a destination and use your phone’s live location to receive a proximity warning as you approach.

The app includes GPS and manual boarding locations, nearby stops and mapped route suggestions, statewide destination search, Tamil/English controls, a map, saved stops, and a simulated demo ride.

## Run locally

```sh
cd tamil-nadu-pilot
npm run dev
```

Open http://localhost:4173. For a real phone journey, host the app over HTTPS and keep the page visible with the screen on. Manual locations support planning; live alerts require fresh phone GPS.

## Check the source

```sh
cd tamil-nadu-pilot
npm test
```

The deployable static app is in `tamil-nadu-pilot/dist/`. No account, API key, database, dependency installation, or build step is required to run the app.

See the [pilot documentation](tamil-nadu-pilot/README.md) for alert limits, data provenance, dataset refresh scripts, offline behaviour, and optional browser checks. Mapped routes are static community data with incomplete coverage; the app does not include live bus positions.
