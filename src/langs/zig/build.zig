const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{ .default_target = .{ .cpu_arch = .wasm32, .os_tag = .freestanding } });
    const optimize = b.standardOptimizeOption(.{ .preferred_optimize_mode = .ReleaseSmall });

    const exe = b.addExecutable(.{
        .name = "wheel-part-zig",
        .root_source_file = .{ .path = "wheel-part.zig" },
        .target = target,
        .optimize = optimize,
    });

    exe.rdynamic = true;
    b.installArtifact(exe);
}
