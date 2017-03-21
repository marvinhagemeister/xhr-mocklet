import { Test } from "tape";
import mock from "../Builder";

export const m = (fn: (t: Test) => void | Promise<any>) =>
  (t: Test) => {
    mock.setup(global);
    fn(t);
    mock.teardown();
    return t;
  };
