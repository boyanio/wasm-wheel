const std = @import("std");
const Rng = std.rand.Pcg;

extern fn seed() callconv(.C) f64;

var rng: Rng = undefined;

pub fn main() void {
    rng = Rng.init(@intFromFloat(seed()));
}

export fn name() callconv(.C) [*c]const u8 {
    return "Zig";
}

export fn feelingLucky() callconv(.C) f64 {
    return @floatFromInt(rng.random().intRangeAtMost(u7, 1, 100));
}
