#include <webassembly.h>

extern void hello(char*);

int main(void) {
  hello("C / C++");
  return 0;
}

export int feelingLucky(void) {
  return rand() % 100 + 1;
}