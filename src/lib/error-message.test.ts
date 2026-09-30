import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { getErrorMessage } from "./error-message.js";

test("error messages survive native, cross-realm and database errors", () => {
  assert.equal(getErrorMessage(new Error("network failed")), "network failed");
  assert.equal(getErrorMessage(runInNewContext('new Error("quota exceeded")')), "quota exceeded");
  assert.equal(getErrorMessage({ message: "row missing", code: "PGRST116" }), "row missing");
  assert.equal(getErrorMessage("request failed"), "request failed");
});

test("unexpected thrown values cannot break the error handler", () => {
  for (const value of [null, undefined, 42, false, {}, { message: 123 }]) {
    assert.equal(getErrorMessage(value), "Unknown error");
  }
  assert.equal(getErrorMessage({ message: "" }), "");
});
