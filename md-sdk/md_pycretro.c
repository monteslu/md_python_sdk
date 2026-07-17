// md_pycretro.c - pycretro runtime shims for the Genesis target.
#include "md_pycretro.h"
#include "md_api.h"

// assert trap: red backdrop + the failing line, then spin. Debug builds only.
void md_assert_fail(int line) {
  for (;;) {
    md_cls(8);
    md_print("ASSERT FAILED line:", 8, 12, 7);
    md_print_int(line, 22, 12, 7);
    md_vsync();
    md_endframe();
  }
}
