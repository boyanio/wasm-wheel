extern fn jsrandom() callconv(.C) f64;

export fn name() callconv(.C) [*c]const u8 {
    return "Zig";
}

export fn feelingLucky() callconv(.C) f64 {
    return @floor(jsrandom() * 100.0) + 1;
}
