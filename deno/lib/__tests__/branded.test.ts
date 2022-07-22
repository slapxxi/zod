// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("branded types", () => {
  const mySchema = z
    .object({
      name: z.string(),
    })
    .brand<"superschema">();

  // simple branding
  type MySchema = z.infer<typeof mySchema>;
  const f1: util.AssertEqual<
    MySchema,
    { name: string } & { [z.BRAND]: { superschema: true } }
  > = true;
  f1;
  const doStuff = (arg: MySchema) => arg;
  doStuff(mySchema.parse({ name: "hello there" }));

  // inheritance
  const extendedSchema = mySchema.brand<"subschema">();
  type ExtendedSchema = z.infer<typeof extendedSchema>;
  const f2: util.AssertEqual<
    ExtendedSchema,
    { name: string } & { [z.BRAND]: { superschema: true; subschema: true } }
  > = true;
  f2;
  doStuff(extendedSchema.parse({ name: "hello again" }));

  // number branding
  const numberSchema = z.number().brand<42>();
  type NumberSchema = z.infer<typeof numberSchema>;
  const f3: util.AssertEqual<
    NumberSchema,
    number & { [z.BRAND]: { 42: true } }
  > = true;
  f3;

  // symbol branding
  const MyBrand: unique symbol = Symbol("hello");
  type MyBrand = typeof MyBrand;
  const symbolBrand = z.number().brand<"sup">().brand<typeof MyBrand>();
  type SymbolBrand = z.infer<typeof symbolBrand>;
  // number & { [z.BRAND]: { [MyBrand]: true } }
  const f4: util.AssertEqual<
    SymbolBrand,
    number & { [z.BRAND]: { 42: true; [MyBrand]: true } }
  > = true;
  f4;

  // @ts-expect-error
  doStuff({ name: "hello there!" });
});
