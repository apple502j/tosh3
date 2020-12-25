const nearley = require("nearley");
const grammar = require("./grammar.js");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

parser.feed(`
@event_whenflagclicked()
assign("variable", 0);
data_showvariable("variable");
procedure_call("sum", 100);
assign("variable", var("return"));

@define warp("sum", reporter "total")
assign("i", 0);
assign("return", 0b0);
repeat (argument_reporter_string_number("total")) {
  data_changevariableby("i", 1);
  data_changevariableby("return", var("i"));
}
`.trim());

console.dir(parser.results[0], {depth: 15});