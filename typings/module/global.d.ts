declare namespace NodeJS {
  interface Global {
    XMLHttpRequest: any
    foo: string;
  }

  interface global {
    bar: string;
  }
}

interface Global {
  nope: string;
}
