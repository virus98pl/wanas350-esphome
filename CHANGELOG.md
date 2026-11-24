# Zmiany

## 2026-11-24

### Dodane
- `esphome/wanas-wilgotnosc.yaml` – czujnik wilgotności wyciągu: NodeMCU v3 (ESP8266) + SHT3x (0x44, I2C D2/D1, 50 kHz). Encje: temperatura, wilgotność, punkt rosy, wilgotność bezwzględna, Wi-Fi, BSSID, uptime, restart.
- `homeassistant/packages/rekuperator_wilgotnosc.yaml` – podbicie biegu przy wilgoci (próg 85 % lub skok 8 pkt ponad minimum z 2 h, z histerezą), powrót po 10 min lub po 90 min, ręczna zmiana kończy podbicie, powiadomienie przy czujniku offline 30 min, sensor zapasu T wyrzutu nad punktem rosy.
- `homeassistant/packages/` – pakiety używane na co dzień: harmonogram dzień/noc, nieobecność (Urlop), alerty.
- `rekuperator_alert.yaml` – awaryjne wyłączenie gniazdka: > 300 W przez 1 min przy K1 ≠ on, > 300 W przez 75 min, T czerpni > 55 °C przez 1 min.
- Karta `rekuperator-card.js` v4–v5: klucze `rh_room`, `rh_boost` (wilgotność, „↑” przy podbiciu), `heater` (animacja grzałki na wlocie), `bypass` (zielona ścieżka omijająca wymiennik, wymiennik przygaszony).
- README: pakiety, czujnik wilgotności, klucze karty, znane ograniczenia.

### Zmienione
- `rekuperator_harmonogram.yaml` – pomija zmianę trybu, gdy trwa podbicie z wilgoci.
- `rekuperator_widok.yaml` – karta dostała klucze `heater`, `bypass`, `rh_room`, `rh_boost`.

### Poprawione
- `rekuperator_wilgotnosc.yaml` – samo `condition` wewnątrz `then` zatrzymywało tylko ten blok, więc podbicie cofało się od razu po własnej zmianie biegu. Zamienione na `if` + `stop`.

## 2026-11-23

### Dodane
- `wanas350.yaml` – zabezpieczenia nagrzewnicy: blokada przy przegrzaniu (T_CZE > nastawy, domyślnie 40 °C) pamiętana po restarcie, alarm i przycisk kasowania; limit ciągłej pracy K1 (domyślnie 60 min), potem 10 min przerwy; brak odczytu T_CZE = nagrzewnica nie grzeje.
- Czujniki „Przewietrzanie/Kominek – pozostało [min]”, korekta T_ZEW −4,3 °C.

### Uwagi
- Test z 23.11 wykazał, że T_CZE i T_ZEW są przed nagrzewnicą – patrz „Znane ograniczenia” w README.
