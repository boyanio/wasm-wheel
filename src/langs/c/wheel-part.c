#include <math.h>
#include <emscripten.h>

extern float random(void);

EMSCRIPTEN_KEEPALIVE char * name(void) {
  return "C / C++";
}

EMSCRIPTEN_KEEPALIVE int feelingLucky(void) {
  return floor(random() * 100) + 1;
}