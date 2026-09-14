import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import ts from "typescript";

const DOC_FILE_NAME = "CLAUDE.md";
const SOURCE_ROOTS = ["src/hooks", "src/storefront/blocks"];
const CHECK_MODE = process.argv.includes("--check");
const projectRoot = process.cwd();

type ExportKind = "component" | "const" | "function" | "interface" | "type";

interface MemberDoc {
  name: string;
  optional: boolean;
  type: string;
  description: string;
}

interface ExportDoc {
  name: string;
  kind: ExportKind;
  source: string;
  description: string;
  signature?: string;
  type?: string;
  members: MemberDoc[];
}

interface FileDoc {
  source: string;
  description: string;
  sections: FileDocSection[];
}

interface FileDocSection {
  title: string;
  lines: string[];
}

interface DirectoryDoc {
  dir: string;
  exports: ExportDoc[];
  children: string[];
  files: FileDoc[];
}

const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.app.json");
if (!configPath) {
  throw new Error("Cannot find tsconfig.app.json");
}

const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) {
  throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
}

const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));

const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
const checker = program.getTypeChecker();
const docsByDir = new Map<string, DirectoryDoc>();
const publicExportsByRoot = new Map<string, Set<string> | null>();

for (const sourceRoot of SOURCE_ROOTS) {
  publicExportsByRoot.set(sourceRoot, getPublicExports(sourceRoot));

  const parts = sourceRoot.split("/");
  for (let index = 1; index <= parts.length; index += 1) {
    ensureDirectoryDoc(parts.slice(0, index).join("/"));
  }
}

for (const fileDoc of getFileDocs()) {
  ensureDirectoryDoc(path.posix.dirname(fileDoc.source)).files.push(fileDoc);
}

for (const sourceFile of program.getSourceFiles()) {
  const relativeFile = toRelative(sourceFile.fileName);
  if (!isDocumentedSource(relativeFile)) continue;

  const sourceRoot = getSourceRoot(relativeFile);
  const publicExports = sourceRoot ? publicExportsByRoot.get(sourceRoot) : null;
  const dir = path.posix.dirname(relativeFile);
  const dirDoc = ensureDirectoryDoc(dir);

  sourceFile.forEachChild((node) => {
    const exportDocs = getExportDocs(node, sourceFile, publicExports ?? null);
    dirDoc.exports.push(...exportDocs.filter((exportDoc) => shouldRenderExport(dir, exportDoc)));
  });
}

for (const dir of [...docsByDir.keys()]) {
  const parent = path.posix.dirname(dir);
  if (parent !== dir && docsByDir.has(parent)) {
    addChild(parent, dir);
  }

  for (const child of getDocumentedChildDirs(dir)) {
    addChild(dir, child);
  }
}

const changed: string[] = [];

for (const doc of [...docsByDir.values()].sort((a, b) => a.dir.localeCompare(b.dir))) {
  if (doc.exports.length === 0 && doc.children.length === 0 && doc.files.length === 0) {
    continue;
  }

  const filePath = path.join(projectRoot, doc.dir, DOC_FILE_NAME);
  const nextContent = await format(renderDirectoryDoc(doc), { parser: "markdown" });
  const previousContent = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";

  if (previousContent !== nextContent) {
    changed.push(toRelative(filePath));
    if (!CHECK_MODE) {
      mkdirSync(path.dirname(filePath), { recursive: true });
      writeFileSync(filePath, nextContent);
    }
  }
}

if (CHECK_MODE && changed.length > 0) {
  console.error(`Outdated ${DOC_FILE_NAME} files:`);
  for (const file of changed) console.error(`- ${file}`);
  process.exit(1);
}

console.log(
  changed.length === 0
    ? `${DOC_FILE_NAME} files are up to date.`
    : `${CHECK_MODE ? "Checked" : "Generated"} ${changed.length} ${DOC_FILE_NAME} file(s).`,
);

function getExportDocs(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  publicExports: Set<string> | null,
): ExportDoc[] {
  if (ts.isInterfaceDeclaration(node) && isExported(node)) {
    if (!isPublicExport(node.name.text, publicExports)) return [];
    return [getInterfaceDoc(node, sourceFile)];
  }

  if (ts.isTypeAliasDeclaration(node) && isExported(node)) {
    if (!isPublicExport(node.name.text, publicExports)) return [];
    return [getTypeAliasDoc(node, sourceFile)];
  }

  if (ts.isFunctionDeclaration(node) && node.name && isExported(node)) {
    if (!isPublicExport(node.name.text, publicExports)) return [];
    if (isComponentFunction(node, sourceFile)) return [];
    return [getFunctionDoc(node, sourceFile)];
  }

  if (ts.isVariableStatement(node) && isExported(node)) {
    return node.declarationList.declarations
      .filter((declaration): declaration is ts.VariableDeclaration & { name: ts.Identifier } =>
        ts.isIdentifier(declaration.name),
      )
      .filter((declaration) => isPublicExport(declaration.name.text, publicExports))
      .map((declaration) => getConstDoc(declaration, sourceFile));
  }

  return [];
}

function getFileDocs(): FileDoc[] {
  const docs: FileDoc[] = [];

  const main = getSourceContractDoc("src/main.tsx");
  if (main) docs.push(main);

  const app = getSourceContractDoc("src/App.tsx");
  if (app) docs.push(app);

  const theme = getThemeDoc("src/theme.css");
  if (theme) docs.push(theme);

  const fonts = getFontsDoc("src/fonts.ts");
  if (fonts) docs.push(fonts);

  const fontImports = getFontImportsDoc("src/fonts.css");
  if (fontImports) docs.push(fontImports);

  return docs;
}

function getSourceContractDoc(source: string): FileDoc | null {
  const absolutePath = path.join(projectRoot, source);
  if (!existsSync(absolutePath)) return null;

  return {
    source,
    description: getLeadingComment(readFileSync(absolutePath, "utf8")),
    sections: [],
  };
}

function getThemeDoc(source: string): FileDoc | null {
  const absolutePath = path.join(projectRoot, source);
  if (!existsSync(absolutePath)) return null;

  const content = readFileSync(absolutePath, "utf8");
  const scopes = getCssVariableScopes(content);

  return {
    source,
    description: getLeadingComment(content),
    sections: scopes.map((scope) => ({
      title: scope.selector,
      lines: scope.variables.map((variable) => `\`${variable.name}\`: \`${variable.value}\``),
    })),
  };
}

function getFontsDoc(source: string): FileDoc | null {
  const absolutePath = path.join(projectRoot, source);
  if (!existsSync(absolutePath)) return null;

  const sourceFile = program.getSourceFile(absolutePath);
  if (!sourceFile) return null;

  const fonts = getStorefrontFonts(sourceFile);
  return {
    source,
    description: getLeadingComment(readFileSync(absolutePath, "utf8")),
    sections: [
      {
        title: "Available fonts",
        lines: fonts.map(
          (font) =>
            `\`${font.id}\`: ${font.label} (${font.role}) = \`${escapeInlineCode(font.cssValue)}\``,
        ),
      },
    ],
  };
}

function getFontImportsDoc(source: string): FileDoc | null {
  const absolutePath = path.join(projectRoot, source);
  if (!existsSync(absolutePath)) return null;

  const content = readFileSync(absolutePath, "utf8");
  const imports = [...content.matchAll(/@import\s+"([^"]+)";/g)].map((match) => match[1]);

  return {
    source,
    description: getLeadingComment(content),
    sections: [
      {
        title: "Current imports",
        lines: imports.map((importPath) => `\`${importPath}\``),
      },
    ],
  };
}

function getCssVariableScopes(content: string): Array<{
  selector: string;
  variables: Array<{ name: string; value: string }>;
}> {
  const cssWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, "");

  return [...cssWithoutComments.matchAll(/([^{}]+)\{([^{}]+)\}/g)]
    .map((match) => ({
      selector: match[1].trim(),
      variables: [...match[2].matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)].map(
        (variableMatch) => ({
          name: variableMatch[1],
          value: normalizeTypeText(variableMatch[2]),
        }),
      ),
    }))
    .filter((scope) => scope.variables.length > 0);
}

function getStorefrontFonts(sourceFile: ts.SourceFile): Array<{
  id: string;
  label: string;
  cssValue: string;
  role: string;
}> {
  const fonts: Array<{ id: string; label: string; cssValue: string; role: string }> = [];

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;

    for (const declaration of node.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "storefrontFonts") {
        continue;
      }

      const initializer = declaration.initializer
        ? unwrapExpression(declaration.initializer)
        : null;
      if (!initializer || !ts.isArrayLiteralExpression(initializer)) continue;

      for (const element of initializer.elements) {
        const object = unwrapExpression(element);
        if (!ts.isObjectLiteralExpression(object)) continue;

        const font = {
          id: getStringProperty(object, "id"),
          label: getStringProperty(object, "label"),
          cssValue: getStringProperty(object, "cssValue"),
          role: getStringProperty(object, "role"),
        };

        if (font.id && font.label && font.cssValue && font.role) fonts.push(font);
      }
    }
  });

  return fonts;
}

function getStringProperty(object: ts.ObjectLiteralExpression, name: string): string {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (!ts.isIdentifier(property.name) || property.name.text !== name) continue;

    const initializer = unwrapExpression(property.initializer);
    return ts.isStringLiteral(initializer) ? initializer.text : "";
  }

  return "";
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;

  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function getPublicExports(sourceRoot: string): Set<string> | null {
  const indexPath = path.join(projectRoot, sourceRoot, "index.ts");
  if (!existsSync(indexPath)) return null;

  const sourceFile = program.getSourceFile(indexPath);
  if (!sourceFile) return null;

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return null;

  return new Set(checker.getExportsOfModule(moduleSymbol).map((symbol) => symbol.name));
}

function isPublicExport(name: string, publicExports: Set<string> | null): boolean {
  return publicExports === null || publicExports.has(name);
}

function getInterfaceDoc(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): ExportDoc {
  const componentName = getComponentNameFromProps(node.name.text);

  return {
    name: componentName ?? node.name.text,
    kind: componentName ? "component" : "interface",
    source: toRelative(sourceFile.fileName),
    description: getDescription(node),
    type: renderInterfaceHeader(node, sourceFile),
    members: node.members.flatMap((member) => getMemberDoc(member, sourceFile)),
  };
}

function isComponentFunction(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): boolean {
  const functionName = node.name?.text;
  if (!functionName || !isPascalCase(functionName)) return false;

  const firstParameter = node.parameters[0];
  if (!firstParameter?.type) return false;

  return normalizeTypeText(firstParameter.type.getText(sourceFile)) === `${functionName}Props`;
}

function getComponentNameFromProps(name: string): string | null {
  if (!name.endsWith("Props")) return null;

  const componentName = name.slice(0, -"Props".length);
  return isPascalCase(componentName) ? componentName : null;
}

function isPascalCase(name: string): boolean {
  return /^[A-Z]/.test(name);
}

function getTypeAliasDoc(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): ExportDoc {
  return {
    name: node.name.text,
    kind: "type",
    source: toRelative(sourceFile.fileName),
    description: getDescription(node),
    type: normalizeTypeText(node.type.getText(sourceFile)),
    members: getTypeLiteralMembers(node.type, sourceFile),
  };
}

function getFunctionDoc(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): ExportDoc {
  return {
    name: node.name?.text ?? "anonymous",
    kind: "function",
    source: toRelative(sourceFile.fileName),
    description: getDescription(node),
    signature: renderFunctionSignature(node, sourceFile),
    members: [],
  };
}

function getConstDoc(
  node: ts.VariableDeclaration & { name: ts.Identifier },
  sourceFile: ts.SourceFile,
): ExportDoc {
  return {
    name: node.name.text,
    kind: "const",
    source: toRelative(sourceFile.fileName),
    description: getDescription(node),
    type: node.type
      ? normalizeTypeText(node.type.getText(sourceFile))
      : normalizeTypeText(checker.typeToString(checker.getTypeAtLocation(node))),
    members: [],
  };
}

function getMemberDoc(member: ts.TypeElement, sourceFile: ts.SourceFile): MemberDoc[] {
  if (!ts.isPropertySignature(member) || !member.name) return [];

  const name = member.name.getText(sourceFile);
  const optional = Boolean(member.questionToken);
  const type = member.type
    ? normalizeTypeText(member.type.getText(sourceFile))
    : normalizeTypeText(checker.typeToString(checker.getTypeAtLocation(member)));

  return [
    {
      name,
      optional,
      type,
      description: getDescription(member),
    },
  ];
}

function getTypeLiteralMembers(node: ts.TypeNode, sourceFile: ts.SourceFile): MemberDoc[] {
  if (ts.isTypeLiteralNode(node)) {
    return node.members.flatMap((member) => getMemberDoc(member, sourceFile));
  }

  if (ts.isIntersectionTypeNode(node)) {
    return node.types.flatMap((typeNode) => getTypeLiteralMembers(typeNode, sourceFile));
  }

  return [];
}

function renderInterfaceHeader(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): string {
  const typeParameters = node.typeParameters
    ? `<${node.typeParameters.map((item) => item.getText(sourceFile)).join(", ")}>`
    : "";
  const heritage = node.heritageClauses?.map((clause) => clause.getText(sourceFile)).join(" ");

  return `interface ${node.name.text}${typeParameters}${heritage ? ` ${heritage}` : ""}`;
}

function renderFunctionSignature(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): string {
  const typeParameters = node.typeParameters
    ? `<${node.typeParameters.map((item) => item.getText(sourceFile)).join(", ")}>`
    : "";
  const parameters = node.parameters
    .map((parameter) => {
      const name = parameter.name.getText(sourceFile);
      const optional = parameter.questionToken ? "?" : "";
      const type = parameter.type
        ? normalizeTypeText(parameter.type.getText(sourceFile))
        : normalizeTypeText(checker.typeToString(checker.getTypeAtLocation(parameter)));
      const initializer = parameter.initializer ? " = ..." : "";
      return `${name}${optional}: ${type}${initializer}`;
    })
    .join(", ");
  const returnType = node.type
    ? normalizeTypeText(node.type.getText(sourceFile))
    : normalizeTypeText(
        checker.typeToString(
          checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)!),
        ),
      );

  return `${node.name?.text ?? "anonymous"}${typeParameters}(${parameters}): ${returnType}`;
}

function getDescription(node: ts.Node): string {
  const symbol = getSymbol(node);
  const fromSymbol = symbol
    ? ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
    : "";

  if (fromSymbol) return fromSymbol;

  const jsDocs = (node as ts.Node & { jsDoc?: ts.JSDoc[] }).jsDoc ?? [];
  return jsDocs
    .map((doc) => (typeof doc.comment === "string" ? doc.comment.trim() : ""))
    .filter(Boolean)
    .join("\n\n");
}

function getSymbol(node: ts.Node): ts.Symbol | undefined {
  if (
    (ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isFunctionDeclaration(node)) &&
    node.name
  ) {
    return checker.getSymbolAtLocation(node.name);
  }

  if (ts.isPropertySignature(node) && node.name) {
    return checker.getSymbolAtLocation(node.name);
  }

  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    return checker.getSymbolAtLocation(node.name);
  }

  return undefined;
}

function renderDirectoryDoc(doc: DirectoryDoc): string {
  const lines: string[] = [];
  lines.push(`# ${doc.dir}`);
  lines.push("");

  const importPath = getImportPath(doc.dir);
  if (importPath) {
    lines.push(`Import from: \`${importPath}\``);
    lines.push("");
  }

  const children = [...doc.children].sort((a, b) => a.localeCompare(b));
  if (children.length > 0) {
    lines.push("## Children");
    lines.push("");
    for (const child of children) {
      const childDoc = docsByDir.get(child);
      const label = child.split("/").at(-1) ?? child;
      const href = `${path.posix.relative(doc.dir, child)}/${DOC_FILE_NAME}`;
      const summary =
        childDoc && shouldRenderChildSummary(doc.dir) ? renderChildSummary(childDoc) : "";
      lines.push(`- [${label}](${href})${summary ? `: ${summary}` : ""}`);
    }
    lines.push("");
  }

  const files = doc.files;
  if (files.length > 0) {
    lines.push("## Files");
    lines.push("");

    for (const file of files) {
      lines.push(`### ${path.posix.basename(file.source)}`);
      lines.push("");

      if (file.description) {
        lines.push(file.description);
        lines.push("");
      }

      for (const section of file.sections) {
        if (section.lines.length === 0) continue;

        lines.push(`${section.title}:`);
        lines.push("");
        for (const line of section.lines) lines.push(`- ${line}`);
        lines.push("");
      }
    }
  }

  const exports = [...doc.exports].sort((a, b) => {
    const sourceOrder = a.source.localeCompare(b.source);
    return sourceOrder || a.name.localeCompare(b.name);
  });

  if (exports.length > 0) {
    lines.push("## Exports");
    lines.push("");

    for (const exportDoc of exports) {
      lines.push(`### ${exportDoc.name}`);
      lines.push("");

      if (exportDoc.signature) {
        lines.push(`Signature: \`${escapeInlineCode(exportDoc.signature)}\``);
      }

      if (exportDoc.type && ["const", "type"].includes(exportDoc.kind)) {
        lines.push(`Type: \`${escapeInlineCode(exportDoc.type)}\``);
      }

      if (exportDoc.description) {
        lines.push("");
        lines.push(exportDoc.description);
      }

      if (exportDoc.members.length > 0) {
        lines.push("");
        lines.push("Properties:");
        lines.push("");
        for (const member of exportDoc.members) {
          const optional = member.optional ? "?" : "";
          lines.push(`- \`${member.name}${optional}: ${escapeInlineCode(member.type)}\``);
          if (member.description) {
            lines.push(`  ${member.description.replace(/\n+/g, " ")}`);
          }
        }
      }

      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function shouldRenderExport(dir: string, exportDoc: ExportDoc): boolean {
  if (dir === "src/hooks") {
    return exportDoc.kind === "function" && exportDoc.name.startsWith("use");
  }

  return true;
}

function renderChildSummary(doc: DirectoryDoc): string {
  const names = doc.exports.map((item) => item.name);
  if (names.length === 0) return "";

  return names.join(", ");
}

function shouldRenderChildSummary(parentDir: string): boolean {
  return SOURCE_ROOTS.includes(parentDir);
}

function ensureDirectoryDoc(dir: string): DirectoryDoc {
  const normalized = normalizeRelativePath(dir);
  const existing = docsByDir.get(normalized);
  if (existing) return existing;

  const next: DirectoryDoc = { dir: normalized, exports: [], children: [], files: [] };
  docsByDir.set(normalized, next);

  const parent = path.posix.dirname(normalized);
  if (parent !== normalized && parent !== ".") ensureDirectoryDoc(parent);

  return next;
}

function getImportPath(dir: string): string {
  const sourceRoot = SOURCE_ROOTS.find((root) => dir === root || dir.startsWith(`${root}/`));
  if (!sourceRoot) return "";
  if (!existsSync(path.join(projectRoot, sourceRoot, "index.ts"))) return "";
  return `@/${sourceRoot.slice("src/".length)}`;
}

function addChild(parent: string, child: string): void {
  const parentDoc = ensureDirectoryDoc(parent);
  const normalizedChild = normalizeRelativePath(child);
  if (!parentDoc.children.includes(normalizedChild)) parentDoc.children.push(normalizedChild);
}

function getDocumentedChildDirs(dir: string): string[] {
  const absoluteDir = path.join(projectRoot, dir);
  if (!existsSync(absoluteDir)) return [];

  return readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => normalizeRelativePath(path.posix.join(dir, entry.name)))
    .filter(
      (child) =>
        isInsideDocumentedRoot(child) || hasDocumentedRootBelow(child) || hasManualDoc(child),
    );
}

function isDocumentedSource(relativeFile: string): boolean {
  if (!/\.(ts|tsx)$/.test(relativeFile)) return false;
  if (relativeFile.endsWith(".d.ts")) return false;
  return SOURCE_ROOTS.some((root) => relativeFile === root || relativeFile.startsWith(`${root}/`));
}

function getSourceRoot(relativePath: string): string | null {
  return (
    SOURCE_ROOTS.find((root) => relativePath === root || relativePath.startsWith(`${root}/`)) ??
    null
  );
}

function isInsideDocumentedRoot(relativePath: string): boolean {
  return SOURCE_ROOTS.some((root) => relativePath === root || relativePath.startsWith(`${root}/`));
}

function hasDocumentedRootBelow(relativePath: string): boolean {
  return SOURCE_ROOTS.some((root) => root.startsWith(`${relativePath}/`));
}

function hasManualDoc(relativePath: string): boolean {
  return existsSync(path.join(projectRoot, relativePath, DOC_FILE_NAME));
}

function isExported(node: ts.Node): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
}

function normalizeTypeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function getLeadingComment(content: string): string {
  const trimmed = content.trimStart();
  const blockComment = trimmed.match(/^\/\*([\s\S]*?)\*\//);
  if (blockComment) return cleanComment(blockComment[1]);

  const lineComments = trimmed.match(/^(?:\/\/.*\n?)+/);
  if (lineComments) return cleanComment(lineComments[0]);

  return "";
}

function cleanComment(comment: string): string {
  return comment
    .split("\n")
    .map((line) =>
      line
        .replace(/^\s*\/\//, "")
        .replace(/^\s*\*\s?/, "")
        .trimEnd(),
    )
    .join("\n")
    .trim();
}

function escapeInlineCode(value: string): string {
  return value.replace(/`/g, "\\`");
}

function toRelative(filePath: string): string {
  return normalizeRelativePath(path.relative(projectRoot, filePath));
}

function normalizeRelativePath(filePath: string): string {
  const normalized = filePath.split(path.sep).join(path.posix.sep);
  return normalized === "" ? "." : normalized;
}
