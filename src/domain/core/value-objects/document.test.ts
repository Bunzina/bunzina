import { Document } from "./document";

describe("document value object", () => {
  test("should create an CPF document with a valid document number", () => {
    const document = new Document("123.456.789-09");

    expect(document).toBeInstanceOf(Document);
    expect(document).toEqual({
      kind: "CPF",
      value: "12345678909",
    } as unknown as Document);
  });
});
