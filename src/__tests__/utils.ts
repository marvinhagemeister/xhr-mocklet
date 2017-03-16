
const mocked = (description: string, fn: (t: test.Test) => void) => {
  test(description, t => {
    mock.setup();
    fn(t);
    mock.teardown();
  });
};
