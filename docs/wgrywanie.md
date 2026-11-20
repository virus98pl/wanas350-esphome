# Wgrywanie programu na KinCony KC868-A4

Pierwsze wgranie robi się przez USB, najlepiej na biurku, zanim płytka trafi do skrzynki. Kolejne aktualizacje idą już przez Wi-Fi (OTA) i nic nie trzeba podłączać.

## Co potrzebne

- KC868-A4 i zasilacz **12 V DC** podłączony do zacisków 12V/GND. Samo USB nie wystarczy, płytka musi mieć 12 V.
- kabel **micro-USB do transmisji danych**. Wiele kabli to tylko kable do ładowania i wtedy komputer w ogóle nie widzi płytki.
- komputer z **Chrome albo Edge**. Wgrywanie przez przeglądarkę (Web Serial) w innych przeglądarkach bywa zawodne.
- Home Assistant z dodatkiem **ESPHome Device Builder**

> ⚠️ Na czas wgrywania płytka ma być zasilana tylko z 12 V. Nic nie może być podłączone do 230 V ani do wentylatorów.

## 1. Sekrety

ESPHome → ⋮ (prawy górny róg) → **Secrets**. Wklej `esphome/secrets.example.yaml` i uzupełnij:
- `wifi_ssid`, `wifi_password`: sieć **2,4 GHz** (ESP32 nie obsługuje 5 GHz)
- `api_key`: wygeneruj na https://esphome.io/components/api/ (pole „encryption key”)
- `ota_password`: dowolne hasło
- `ap_password`: hasło awaryjnej sieci `wanas350-awaryjny` (min. 8 znaków)

## 2. Urządzenie w ESPHome

1. **+ New device** → Continue → nazwa `wanas350` → ESP32 → **Skip** (na razie bez instalacji).
2. Na kafelku `wanas350` kliknij **Edit**, Ctrl+A, wklej zawartość `esphome/wanas350.yaml` i zapisz.
3. Wgraj plik `esphome/wanas350_czas.h` do folderu `/config/esphome/` w Home Assistant, obok `wanas350.yaml` (np. dodatkiem **File editor** albo **Studio Code Server**). Bez niego walidacja i kompilacja kończą się błędem.
4. ⋮ → **Validate**. Powinno pokazać „Configuration is valid”.

## 3. Kompilacja

**Install → Manual download → Factory format**. Pierwsza kompilacja trwa 5–15 minut, na końcu pobiera się plik `.bin`.

## 4. Wgranie przez USB

1. Podłącz 12 V i kabel USB do komputera.
2. **Sterownik CH340.** Na płytce jest układ USB CH340C. Jeśli w Menedżerze urządzeń nie pojawia się nowy port COM, zainstaluj sterownik CH340 (do pobrania z kincony.com albo wch-ic.com) i podłącz kabel jeszcze raz.
3. Otwórz https://web.esphome.io w Chrome/Edge → **Connect** → wybierz port COM (zwykle „USB-SERIAL CH340”).
4. **Install** → wskaż pobrany `.bin` → Install. Trwa to 1–2 minuty.

### Gdy się nie łączy („Failed to connect”, „Timed out waiting for packet header”)

Płytka powinna sama wejść w tryb wgrywania, bo CH340 przez DTR/RTS robi automatyczny reset. U nas to nie zawsze działało. Wtedy trzeba to zrobić ręcznie przyciskami na płytce:

| Przycisk | Co robi |
|---|---|
| **S1** | RESET (EN): restart płytki |
| **S2** | BOOT (IO0): tryb wgrywania |

1. Wciśnij i **trzymaj S2** (BOOT).
2. Krótko naciśnij i puść **S1** (RESET).
3. Puść **S2**.
4. Teraz kliknij **Connect / Install** w przeglądarce.

Płytka jest wtedy w trybie wgrywania aż do kolejnego resetu. Po wgraniu naciśnij S1 albo odłącz i podłącz zasilanie.

Uwaga: S1 to nie BOOT! Łatwo pomylić te przyciski. Samo przytrzymanie S1 tylko resetuje płytkę.

Inne typowe problemy:
- port jest zajęty: zamknij inne programy, które mogą go trzymać (Arduino IDE, PlatformIO, inna karta z web.esphome.io)
- przerywa w trakcie: spróbuj innego portu USB (najlepiej bezpośrednio w komputerze, nie przez hub) albo innego kabla

## 5. Dodanie do Home Assistant

Po restarcie płytka łączy się z Wi-Fi i w HA pojawia się powiadomienie „Wykryto: wanas350” → **Konfiguruj** → podaj `api_key`.

Jeśli powiadomienie się nie pojawi: Ustawienia → Urządzenia i usługi → Dodaj integrację → ESPHome → `wanas350.local` albo adres IP z routera.

Jeśli płytka nie połączy się z Wi-Fi, wystawia własną sieć **„wanas350-awaryjny”**. Połącz się z nią telefonem i wpisz poprawne dane sieci.

## 6. Kolejne aktualizacje

ESPHome → `wanas350` → **Install → Wirelessly**. USB nie jest już potrzebne.

## 7. Adresy czujników DS18B20

1. ESPHome → `wanas350` → **Logs**. Przy starcie pojawia się lista „Found 1-Wire devices” z adresami `0x…`.
2. Wpisz je w `substitutions` (`addr_t_zew` … `addr_t_wyr`) i zrób Install → Wirelessly.
3. Ogrzej dłonią jeden czujnik i zobacz w HA, która temperatura rośnie. Powtórz dla każdego czujnika i popraw kolejność adresów.
