import { describe, expect, test } from "bun:test";
import { Entity } from "./entity";

class StubEntity extends Entity {}

describe("core entity", () => {
  test("should create an entity with a self generated id", () => {
    const entity = new StubEntity();

    expect(typeof entity.id).toBe("string");
    expect(entity.id).toBeTruthy();
  });

  test("should accept an custom id", () => {
    const entity = new StubEntity("custom-id");

    expect(entity.id).toBe("custom-id");
  });

  test("should return equals to the same entity", () => {
    const entity = new StubEntity("id-1");

    expect(entity.equals(entity)).toBe(true);
  });

  test("should return true to different entities with same id", () => {
    const entityA = new StubEntity("shared-id");
    const entityB = new StubEntity("shared-id");

    expect(entityA.equals(entityB)).toBe(true);
    expect(entityB.equals(entityA)).toBe(true);
  });

  test("should return false to different ids", () => {
    const entityA = new StubEntity("id-a");
    const entityB = new StubEntity("id-b");

    expect(entityA.equals(entityB)).toBe(false);
  });
});
