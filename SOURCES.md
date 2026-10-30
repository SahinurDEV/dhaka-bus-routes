# তথ্যসূত্র / Sources

Route membership and stop order:
1. imamhossain94/dhaka-city-local-bus-json-data — https://github.com/imamhossain94/dhaka-city-local-bus-json-data (scraped from busroutebd.com; 156 service entries). Used as the primary dataset; all services and stop sequences in `data.js` come from here. Merged scrape artefacts (e.g. "Mirpur 2 Mirpur 10") were split, spelling variants merged.
2. Anupamasite — ঢাকা বাস রুট: https://anupamasite.com/dhaka_bus_route_and_fare.php (cross-check; ~117 of 138 operator names and sample sequences such as Bihanga, Raida, Victor Classic match).
3. Dhaka Bus Vara — https://busvara.talukdaracademy.com.bd/route/victor-classic-bus-route (cross-check of Victor Classic stop order).
4. joynto1 Dhaka Local Bus — https://joynto1.github.io/dhaka_local_bus/bus_routes/raida.html (cross-check of Raida stop order).

Fares: BRTA Dhaka city rate ≈ Tk 2.45/km, minimum Tk 10 (estimate only). Stop coordinates are approximate (hand-placed; unknown minor stops interpolated between neighbours), so distances/fares are estimates. Source data dates from 2021 — routes may have changed.

## Fares (updated)
- Rate: Tk 2.70/km, minimum Tk 10 for Dhaka city buses, effective 22 Sep 2026 (BSS/TBS/Financial Express reports, 23 Sep 2026).
- Distances: the official BRTA Dhaka metro fare charts (https://brta.gov.bd/pages/static-pages/6922de89933eb65569e1b600), taken from the machine-readable copy at https://github.com/imamhossain94/dhaka-metro-area-bus-fare-list (112 routes). Fare = round(|chart km A − chart km B| × 2.70), minimum 10. Labelled "বিআরটিএ চার্ট".
- When no chart covers both stops, the fare uses the same rate on an approximate distance (straight line × 1.3 between approximate coordinates). Labelled "বিআরটিএ হার অনুযায়ী · আনুমানিক দূরত্ব".

## Minor stops and aliases
- Minor stops come only from the BRTA charts. They are inserted into a service only when a chart lists them between two consecutive stops of that service (at most 4). Coordinates for new stops are interpolated along the chart by distance, so they are approximate.
- Aliases are the BRTA spelling variants plus common colloquial and English names (see `ALIASES` in data.js).

## Map
- Leaflet + OpenStreetMap tiles. Road distance comes from the public OSRM demo router (router.project-osrm.org); if that fails, the straight-line distance is shown. The map distance is for information only; fares use the chart or the formula above.
