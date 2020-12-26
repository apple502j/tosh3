const nearley = require("nearley");
const HumanDiff = require('human-object-diff');
const grammar = require("./grammar.js");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const { diff } = new HumanDiff({});

parser.feed(`
@event_whenflagclicked()
assign("variable", 0);
data_showvariable("variable");
procedure_call("sum", 100);
assign("variable", var("return"));

// total is expected to be integer
@define warp("sum", reporter "total")
assign("i", 0);
assign("return", 0b0);
// Slow but works
repeat (strarg("total")) {
  data_changevariableby("i", 1);
  data_changevariableby("return", var("i"));
}
`.trim());
const results = parser.results[0];
console.dir(results, {depth: 15});