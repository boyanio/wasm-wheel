#include <math.h>

extern float jsrandom(void);

char * name(void) {
  return "C / C++";
}

int feelingLucky(void) {
  return floor(jsrandom() * 100) + 1;
}