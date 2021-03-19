// WARNING: These tests are specific to my system

import { getText, writeText } from "../fileio";

describe("file io", () => {
  test("get file data", async () => {
    const data = await getText("test.md");
    expect(data).toBe(`# Test file\n`);
  });
  test("write file data", () => {
    const text = String(new Date().getTime());
    writeText("test-write.md", text, (err) => {
      expect(err).toBeUndefined();
      getText("test-write.md", (data: string) => expect(data).toBe(text));
      //restore back
    });
  });
});
