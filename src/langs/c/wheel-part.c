#include <webassembly.h>

export char * name(void) {
  return "C / C++";
}

export int feelingLucky(void) {
  return rand() % 100 + 1;
}