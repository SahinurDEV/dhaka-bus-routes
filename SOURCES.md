# তথ্যসূত্র / Sources

Route membership and stop order:
1. imamhossain94/dhaka-city-local-bus-json-data — https://github.com/imamhossain94/dhaka-city-local-bus-json-data (scraped from busroutebd.com; 156 service entries). Used as the primary dataset; all services and stop sequences in `data.js` come from here. Merged scrape artefacts (e.g. "Mirpur 2 Mirpur 10") were split, spelling variants merged.
2. Anupamasite — ঢাকা বাস রুট: https://anupamasite.com/dhaka_bus_route_and_fare.php (cross-check; ~117 of 138 operator names and sample sequences such as Bihanga, Raida, Victor Classic match).
3. Dhaka Bus Vara — https://busvara.talukdaracademy.com.bd/route/victor-classic-bus-route (cross-check of Victor Classic stop order).
4. joynto1 Dhaka Local Bus — https://joynto1.github.io/dhaka_local_bus/bus_routes/raida.html (cross-check of Raida stop order).

Fares: BRTA Dhaka city rate ≈ Tk 2.45/km, minimum Tk 10 (estimate only). Stop coordinates are approximate (hand-placed; unknown minor stops interpolated between neighbours), so distances/fares are estimates. Source data dates from 2021 — routes may have changed.
