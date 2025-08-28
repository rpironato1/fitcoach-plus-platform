import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("deve combinar classes corretamente", () => {
    const result = cn("bg-red-500", "text-white");
    expect(result).toBe("bg-red-500 text-white");
  });

  it("deve sobrescrever classes conflitantes", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("deve lidar com valores undefined e null", () => {
    const result = cn("bg-red-500", undefined, null, "text-white");
    expect(result).toBe("bg-red-500 text-white");
  });

  it("deve lidar com classes condicionais", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("deve lidar com objetos de classe", () => {
    const result = cn({
      "bg-red-500": true,
      "text-white": false,
      border: true,
    });
    expect(result).toBe("bg-red-500 border");
  });
});
