import * as dummy from "enhanced-resolve";

// the type is reolved to @types/node,
// but I expect it to resolve to @types/assert
import assert from "assert";

// It will resolve correctly if I comment out the first line.
