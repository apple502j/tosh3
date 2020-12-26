# tosh3 Syntax Guide
## Summary
tosh3 is a text-based language that can be "compiled" into sb3 file. It features PHP-like syntaxes.

## Scripts
Scripts start with one hat block. Scripts are separated with a blank line; if you need to insert blank line inside a script, use a comment.

A line that (after trimming whitespaces) starts with `//` is a comment, and is ignored.

tosh3 does not require special indentation or spacing; these all function the same.

```
@event_whenflagclicked()
if (sensing_keypressed("up arrow")) {
  looks_sayforsecs("Hi!", 2);
}
```

```
@event_whenflagclicked()
if(sensing_keypressed("up arrow")){
looks_sayforsecs("Hi!",2);
}
```

## Types
Types are mostly the same as tosh v1 or other languages.

### Notes
While it internally recognizes boolean as a type, tosh3 does not have boolean constants. Use `not()` for `true` and `or(,)` for `false`.

tosh3 supports exponential notation (`-3.34e-2`) and omitting zero before/after decimal point (`-.123`). Negative zero, Infinity and NaN cannot be directly input. For Infinity, use `div(1,0)`. For NaN, use `div(0,0)`. You can also use binary, octal or hexadecimal notations for positive integers (and zero), useful for color inputs (`sensing_touchingcolor(0xFF0000)`).

Backslash is used for escaping in strings.

## Blocks
### Arguments
Arguments are placed inside parens (like `sensing_askandwait("Username?")`) and separated by commas.

Argument order is the same as Scratch's. Most arguments check the type when parsing. Procedure arguments are checked when the code is turned into sb3 file. There are 4 types of arguments:

- `menuitem` is a menu item that does not accept reporter blocks.
- `reportable` is an argument that accepts strings, numbers or reporter blocks (including boolean blocks). This includes a menu item that accepts reporters.
- `numable` is an argument that accepts numbers or reporter blocks (including boolean blocks).
- `boolable` is an argument that accepts boolean blocks or empty value.

You cannot omit arguments, so these all error:
```
looks_say()

looks_sayforsecs("Hi")
```

You can, however, "skip" `boolable` input, like `or(sensing_mousedown(), )`. If you want to leave the argument empty, for `numable` arguments, use `0`, and for `reportable` arguments, use `""` or `''`.

### Hat Blocks
Hat blocks start with `@`, then opcode and arguments.
```
@event_whenflagclicked()

@event_whenbroadcastreceived("Hi")

@event_whengreaterthan("loudness", 50)
```

### C/E Blocks
C and E blocks are as follows:
```
if (sensing_mousedown()) {
  sensing_resettimer()
}

if (sensing_mousedown()) {
  sensing_resettimer()
} else {
  sound_playuntildone("meow")
}

repeat (10) {
  looks_nextcostume()
}

until (sensing_mousedown()) {
  looks_nextcostume()
}

forever {
  looks_nextcostume()
}
```

### Stack blocks
tosh3 tokenizer handles cap blocks as stack blocks. Blocks after cap blocks are silently removed when generating sb3 file.

There can only be one stack block per line.

Stack block can end with a semicolon, but is not required.

### Procedures
Procedures (custom blocks) are defined using `@define` syntax. To define warping (run without screen refresh) procedures, use `@define warp`. Procedures are internally converted to `NAME(ARG1, ARG2)` format.

To define a procedure named `clear`:
```
@define("clear")
looks_cleargraphiceffects()
```

To define a procedure with arguments:
```
@define("sum", reporter "num", boolean "useFastMethod")
```

To obtain arguments, use `strarg("sum")` or `boolarg("useFastMethod")`.

### Opcode
Scratch 3.0 block opcode can always be used. Some common opcodes have aliases.

| Alias  | Opcode             | Block        |
|--------|--------------------|--------------|
| add    | operator_add       | () + ()      |
| sub    | operator_subtract  | () - ()      |
| mul    | operator_multiply  | () * ()      |
| div    | operator_divide    | () / ()      |
| mod    | operator_mod       | () mod ()    |
| lt     | operator_lt        | () < ()      |
| eq     | operator_equals    | () = ()      |
| gt     | operator_gt        | () > ()      |
| and    | operator_and       | () and ()    |
| or     | operator_or        | () or ()     |
| not    | operator_not       | not ()       |
| join   | operator_join      | join () ()   |
| round  | operator_round     | round ()     |
| var    | data_variable      | ()           |
| assign | data_setvariableto | set () to () |
| list   | data_listcontents  | ()           |

There are also some "nicknames", named after PHP functions with similar behaviors. Note that this does not change the behavior itself; `mt_rand` is not guaranteed to use Mersenne twister, and `stristr` does not return numbers.

| Nickname   | Opcode            | Block                |
|------------|-------------------|----------------------|
| mt_rand    | operator_random   | pick random () to () |
| strcasecmp | operator_equals   | () = ()              |
| strlen     | operator_length   | length of ()         |
| stristr    | operator_contains | () contains ()       |