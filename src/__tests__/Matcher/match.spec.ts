import * as test from "tape";
import { match } from "../../Matcher";

test("should match", t => {
  const req = {
    body: "",
    headers: {},
    method: "GET",
    url: "/foo",
  };

  t.equal(match("GET", "/foo")(req), true);
  t.equal(match("GET", /foo/g)(req), true);
  t.equal(match("GET", /bar/g)(req), false);
  t.equal(match("POST", "foo")(req), false);
  t.end();
});
