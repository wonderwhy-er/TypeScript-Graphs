import * as ts from "typescript";


var tokens = (function () {
    return `Unknown = 0,
EndOfFileToken = 1,
SingleLineCommentTrivia = 2,
MultiLineCommentTrivia = 3,
NewLineTrivia = 4,
WhitespaceTrivia = 5,
ShebangTrivia = 6,
ConflictMarkerTrivia = 7,
NumericLiteral = 8,
StringLiteral = 9,
RegularExpressionLiteral = 10,
NoSubstitutionTemplateLiteral = 11,
TemplateHead = 12,
TemplateMiddle = 13,
TemplateTail = 14,
OpenBraceToken = 15,
CloseBraceToken = 16,
OpenParenToken = 17,
CloseParenToken = 18,
OpenBracketToken = 19,
CloseBracketToken = 20,
DotToken = 21,
DotDotDotToken = 22,
SemicolonToken = 23,
CommaToken = 24,
LessThanToken = 25,
LessThanSlashToken = 26,
GreaterThanToken = 27,
LessThanEqualsToken = 28,
GreaterThanEqualsToken = 29,
EqualsEqualsToken = 30,
ExclamationEqualsToken = 31,
EqualsEqualsEqualsToken = 32,
ExclamationEqualsEqualsToken = 33,
EqualsGreaterThanToken = 34,
PlusToken = 35,
MinusToken = 36,
AsteriskToken = 37,
AsteriskAsteriskToken = 38,
SlashToken = 39,
PercentToken = 40,
PlusPlusToken = 41,
MinusMinusToken = 42,
LessThanLessThanToken = 43,
GreaterThanGreaterThanToken = 44,
GreaterThanGreaterThanGreaterThanToken = 45,
AmpersandToken = 46,
BarToken = 47,
CaretToken = 48,
ExclamationToken = 49,
TildeToken = 50,
AmpersandAmpersandToken = 51,
BarBarToken = 52,
QuestionToken = 53,
ColonToken = 54,
AtToken = 55,
EqualsToken = 56,
PlusEqualsToken = 57,
MinusEqualsToken = 58,
AsteriskEqualsToken = 59,
AsteriskAsteriskEqualsToken = 60,
SlashEqualsToken = 61,
PercentEqualsToken = 62,
LessThanLessThanEqualsToken = 63,
GreaterThanGreaterThanEqualsToken = 64,
GreaterThanGreaterThanGreaterThanEqualsToken = 65,
AmpersandEqualsToken = 66,
BarEqualsToken = 67,
CaretEqualsToken = 68,
Identifier = 69,
BreakKeyword = 70,
CaseKeyword = 71,
CatchKeyword = 72,
ClassKeyword = 73,
ConstKeyword = 74,
ContinueKeyword = 75,
DebuggerKeyword = 76,
DefaultKeyword = 77,
DeleteKeyword = 78,
DoKeyword = 79,
ElseKeyword = 80,
EnumKeyword = 81,
ExportKeyword = 82,
ExtendsKeyword = 83,
FalseKeyword = 84,
FinallyKeyword = 85,
ForKeyword = 86,
FunctionKeyword = 87,
IfKeyword = 88,
ImportKeyword = 89,
InKeyword = 90,
InstanceOfKeyword = 91,
NewKeyword = 92,
NullKeyword = 93,
ReturnKeyword = 94,
SuperKeyword = 95,
SwitchKeyword = 96,
ThisKeyword = 97,
ThrowKeyword = 98,
TrueKeyword = 99,
TryKeyword = 100,
TypeOfKeyword = 101,
VarKeyword = 102,
VoidKeyword = 103,
WhileKeyword = 104,
WithKeyword = 105,
ImplementsKeyword = 106,
InterfaceKeyword = 107,
LetKeyword = 108,
PackageKeyword = 109,
PrivateKeyword = 110,
ProtectedKeyword = 111,
PublicKeyword = 112,
StaticKeyword = 113,
YieldKeyword = 114,
AbstractKeyword = 115,
AsKeyword = 116,
AnyKeyword = 117,
AsyncKeyword = 118,
AwaitKeyword = 119,
BooleanKeyword = 120,
ConstructorKeyword = 121,
DeclareKeyword = 122,
GetKeyword = 123,
IsKeyword = 124,
ModuleKeyword = 125,
NamespaceKeyword = 126,
RequireKeyword = 127,
NumberKeyword = 128,
SetKeyword = 129,
StringKeyword = 130,
SymbolKeyword = 131,
TypeKeyword = 132,
FromKeyword = 133,
GlobalKeyword = 134,
OfKeyword = 135,
QualifiedName = 136,
ComputedPropertyName = 137,
TypeParameter = 138,
Parameter = 139,
Decorator = 140,
PropertySignature = 141,
PropertyDeclaration = 142,
MethodSignature = 143,
MethodDeclaration = 144,
Constructor = 145,
GetAccessor = 146,
SetAccessor = 147,
CallSignature = 148,
ConstructSignature = 149,
IndexSignature = 150,
TypePredicate = 151,
TypeReference = 152,
FunctionType = 153,
ConstructorType = 154,
TypeQuery = 155,
TypeLiteral = 156,
ArrayType = 157,
TupleType = 158,
UnionType = 159,
IntersectionType = 160,
ParenthesizedType = 161,
ThisType = 162,
StringLiteralType = 163,
ObjectBindingPattern = 164,
ArrayBindingPattern = 165,
BindingElement = 166,
ArrayLiteralExpression = 167,
ObjectLiteralExpression = 168,
PropertyAccessExpression = 169,
ElementAccessExpression = 170,
CallExpression = 171,
NewExpression = 172,
TaggedTemplateExpression = 173,
TypeAssertionExpression = 174,
ParenthesizedExpression = 175,
FunctionExpression = 176,
ArrowFunction = 177,
DeleteExpression = 178,
TypeOfExpression = 179,
VoidExpression = 180,
AwaitExpression = 181,
PrefixUnaryExpression = 182,
PostfixUnaryExpression = 183,
BinaryExpression = 184,
ConditionalExpression = 185,
TemplateExpression = 186,
YieldExpression = 187,
SpreadElementExpression = 188,
ClassExpression = 189,
OmittedExpression = 190,
ExpressionWithTypeArguments = 191,
AsExpression = 192,
TemplateSpan = 193,
SemicolonClassElement = 194,
Block = 195,
VariableStatement = 196,
EmptyStatement = 197,
ExpressionStatement = 198,
IfStatement = 199,
DoStatement = 200,
WhileStatement = 201,
ForStatement = 202,
ForInStatement = 203,
ForOfStatement = 204,
ContinueStatement = 205,
BreakStatement = 206,
ReturnStatement = 207,
WithStatement = 208,
SwitchStatement = 209,
LabeledStatement = 210,
ThrowStatement = 211,
TryStatement = 212,
DebuggerStatement = 213,
VariableDeclaration = 214,
VariableDeclarationList = 215,
FunctionDeclaration = 216,
ClassDeclaration = 217,
InterfaceDeclaration = 218,
TypeAliasDeclaration = 219,
EnumDeclaration = 220,
ModuleDeclaration = 221,
ModuleBlock = 222,
CaseBlock = 223,
ImportEqualsDeclaration = 224,
ImportDeclaration = 225,
ImportClause = 226,
NamespaceImport = 227,
NamedImports = 228,
ImportSpecifier = 229,
ExportAssignment = 230,
ExportDeclaration = 231,
NamedExports = 232,
ExportSpecifier = 233,
MissingDeclaration = 234,
ExternalModuleReference = 235,
JsxElement = 236,
JsxSelfClosingElement = 237,
JsxOpeningElement = 238,
JsxText = 239,
JsxClosingElement = 240,
JsxAttribute = 241,
JsxSpreadAttribute = 242,
JsxExpression = 243,
CaseClause = 244,
DefaultClause = 245,
HeritageClause = 246,
CatchClause = 247,
PropertyAssignment = 248,
ShorthandPropertyAssignment = 249,
EnumMember = 250,
SourceFile = 251,
JSDocTypeExpression = 252,
JSDocAllType = 253,
JSDocUnknownType = 254,
JSDocArrayType = 255,
JSDocUnionType = 256,
JSDocTupleType = 257,
JSDocNullableType = 258,
JSDocNonNullableType = 259,
JSDocRecordType = 260,
JSDocRecordMember = 261,
JSDocTypeReference = 262,
JSDocOptionalType = 263,
JSDocFunctionType = 264,
JSDocVariadicType = 265,
JSDocConstructorType = 266,
JSDocThisType = 267,
JSDocComment = 268,
JSDocTag = 269,
JSDocParameterTag = 270,
JSDocReturnTag = 271,
JSDocTypeTag = 272,
JSDocTemplateTag = 273,
SyntaxList = 274,
Count = 275,
FirstAssignment = 56,
LastAssignment = 68,
FirstReservedWord = 70,
LastReservedWord = 105,
FirstKeyword = 70,
LastKeyword = 135,
FirstFutureReservedWord = 106,
LastFutureReservedWord = 114,
FirstTypeNode = 151,
LastTypeNode = 163,
FirstPunctuation = 15,
LastPunctuation = 68,
FirstToken = 0,
LastToken = 135,
FirstTriviaToken = 2,
LastTriviaToken = 7,
FirstLiteralToken = 8,
LastLiteralToken = 11,
FirstTemplateToken = 11,
LastTemplateToken = 14,
FirstBinaryOperator = 25,
LastBinaryOperator = 68,
FirstNode = 136`;
})();

var tokenMap = {};
tokens.split(',\n').map((token:string) => {
    var pair = token.split(' = ');
    tokenMap[pair[1]] = pair[0];
    return pair;
});

export function tokenKindName(kind:ts.SyntaxKind):string {
    return tokenMap[kind];
}

export function parse(fileNames:string[]) {
    let program = ts.createProgram(fileNames, {
        target: ts.ScriptTarget.ES6, module: ts.ModuleKind.CommonJS
    });
    return {
        sourceFiles:program.getSourceFiles(),
        checker: program.getTypeChecker()
    }
}