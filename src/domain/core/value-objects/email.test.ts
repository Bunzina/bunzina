import { Email } from "./email";

describe("email value object", () => {
  test("should create an email with a valid email address", () => {
    const email = new Email("robert.mineirin@gmail.com");

    expect(email).toBeInstanceOf(Email);
  });

  test("should throw an error for an invalid email address", () => {
    expect(() => new Email("invalid-email")).toThrow("Invalid email address");
    expect(() => new Email("another-invalid-email@")).toThrow(
      "Invalid email address",
    );
    expect(() => new Email("@no-local-part.com")).toThrow(
      "Invalid email address",
    );
  });
});
