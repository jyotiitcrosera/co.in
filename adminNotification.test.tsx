import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminNotification } from "@/components/AdminNotification";

describe("Admin top notifications", () => {
  it("renders a loading spinner state without an OK action while work is active", () => {
    const html = renderToStaticMarkup(<AdminNotification notification={{ tone: "loading", message: "Loading students…" }} onDismiss={vi.fn()} />);
    expect(html).toContain("Loading students");
    expect(html).toContain("Loading");
    expect(html).not.toContain(">OK<");
  });

  it("renders success and error notifications with an OK dismissal action", () => {
    const success = renderToStaticMarkup(<AdminNotification notification={{ tone: "success", message: "Records saved." }} onDismiss={vi.fn()} />);
    const error = renderToStaticMarkup(<AdminNotification notification={{ tone: "error", message: "Could not save records." }} onDismiss={vi.fn()} />);
    expect(success).toContain("Records saved.");
    expect(success).toContain(">OK<");
    expect(error).toContain("Could not save records.");
    expect(error).toContain(">OK<");
  });
});
