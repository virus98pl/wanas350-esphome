#pragma once
// Pomocnicza funkcja dla wanas350.yaml (esphome: includes: - wanas350_czas.h).
// Plik musi leżeć w tym samym folderze co wanas350.yaml
// (w Home Assistant: /config/esphome/wanas350_czas.h).
//
// sek_od_startu(): liczba sekund od startu sterownika.
// W odróżnieniu od millis()/1000 nie przewija się po ~49,7 dnia,
// bo korzysta z 64-bitowego licznika esp_timer (mikrosekundy).
#include <cstdint>
#include "esp_timer.h"

inline uint32_t sek_od_startu() {
  return (uint32_t) (esp_timer_get_time() / 1000000ULL);
}
