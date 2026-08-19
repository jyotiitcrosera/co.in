import { afterEach, describe, expect, it } from "vitest";
import { __setDbForTests, createAuditLog } from "./db";

afterEach(() => __setDbForTests(null));

describe("audit persistence", () => {
  it("inserts an Admin action with actor, role, entity, and details", async () => {
    const calls: unknown[] = [];
    const fakeDb = {
      insert(table: unknown) {
        expect(table).toBeDefined();
        return { values: async (payload: unknown) => { calls.push(payload); } };
      },
    } as any;
    __setDbForTests(fakeDb);

    await expect(createAuditLog({ actor: "admin", actorRole: "admin", action: "publish_notice", entity: "notice", details: "Welcome notice" })).resolves.toEqual({ persisted: true });
    expect(calls).toEqual([{ actor: "admin", actorRole: "admin", action: "publish_notice", entity: "notice", details: "Welcome notice" }]);
  });
});
