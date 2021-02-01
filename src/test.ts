import * as ts from "typescript";

collectInterfaceInfo(process.argv.slice(2)[0], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
});

interface InterfaceInfo {
  name: string;
  commentText: string;
  documentation: string;
  properties: { [name: string]: InterfacePropertyInfo };
}

interface InterfacePropertyInfo {
  name: string;
  commentText: string;
  typeToString: string;
  documentation: string;
}

function collectInterfaceInfo(
  fileName: string,
  options: ts.CompilerOptions
): InterfaceInfo[] {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram([fileName], options);
  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(fileName)!;
  const sourceFileFullText = sourceFile.getFullText();
  const output: InterfaceInfo[] = [];
  ts.forEachChild(sourceFile, visit);

  return output;

  /** visit nodes finding exported classes */
  function visit(node: ts.Node) {
    // Only consider exported nodes
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isInterfaceDeclaration(node)) {
      const type = checker.getTypeAtLocation(node);
      const symbol = type.getSymbol();
      if (!symbol) {
        throw new Error(`can't find symbol`);
      }
      const name = node.name.getText();
      const commentText = getComment(node, sourceFileFullText) ?? "";
      const documentation = ts.displayPartsToString(
        symbol.getDocumentationComment(checker)
      );

      // ts.display

      const propertiesInfo: { [name: string]: InterfacePropertyInfo } = {};

      type.getProperties().forEach((symbol) => {
        const name = symbol.name;
        const declaration = symbol.valueDeclaration;
        if (!declaration) return;
        const commentText = getComment(declaration, sourceFileFullText) ?? "";
        const typeToString = checker.typeToString(
          checker.getTypeOfSymbolAtLocation(symbol, declaration)
        );
        const documentation = ts.displayPartsToString(
          symbol.getDocumentationComment(checker)
        );
        propertiesInfo[name] = {
          name,
          commentText,
          typeToString,
          documentation,
        };
      });

      const interfaceInfo: InterfaceInfo = {
        name,
        commentText,
        documentation,
        properties: propertiesInfo,
      };

      output.push(interfaceInfo);
    }
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) &
        ts.ModifierFlags.Export) !==
        0 &&
      !!node.parent &&
      node.parent.kind === ts.SyntaxKind.SourceFile
    );
  }
}

function getJSDocCommentRanges(
  node: ts.Node,
  text: string
): ts.CommentRange[] | undefined {
  // Compiler internal:
  // https://github.com/microsoft/TypeScript/blob/66ecfcbd04b8234855a673adb85e5cff3f8458d4/src/compiler/utilities.ts#L1202
  return (ts as any).getJSDocCommentRanges.apply(ts, arguments);
}

function getComment(declaration: ts.Declaration, sourceFileFullText: string) {
  const ranges = getJSDocCommentRanges(declaration, sourceFileFullText);
  if (!ranges || !ranges.length) return;
  const range = ranges[ranges.length - 1];
  if (!range) return;
  const text = sourceFileFullText.slice(range.pos, range.end);
  return text;
}
