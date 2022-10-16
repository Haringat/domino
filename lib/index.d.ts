declare module "domino/Document.mjs" {
  export const foo: string;
}

declare module "domino" {
  function createDOMImplementation(): DOMImplementation;
  function createDocument(html?: string, force?: boolean): Document;
  function createWindow(html?: string, address?: string): Window;
  function createIncrementalHTMLParser(): {write(s: string): void; end(s: string): void; process(shouldPauseFunc: () => boolean): boolean; document(): Document};
  const impl: {
    CSSStyleDeclaration: import('./CSSStyleDeclaration.mjs'),
    CharacterData: import('./CharacterData.mjs'),
    Comment: import('./Comment.mjs'),
    DOMException: import('./DOMException.mjs'),
    DOMImplementation: import('./DOMImplementation.mjs'),
    DOMTokenList: import('./DOMTokenList.mjs').default,
    Document: import('./Document.mjs').default,
    DocumentFragment: import('./DocumentFragment.mjs'),
    DocumentType: import('./DocumentType.mjs'),
    Element: import('./Element.mjs'),
    HTMLParser: import('./HTMLParser.mjs'),
    NamedNodeMap: import('./NamedNodeMap'),
    Node: import('./Node'),
    NodeList: import('./NodeList.mjs'),
    NodeFilter: import('./NodeFilter'),
    ProcessingInstruction: import('./ProcessingInstruction'),
    Text: import('./Text'),
    Window: import('./Window')
  }
}
