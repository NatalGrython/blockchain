import gulpPackage from "gulp";
import typescriptCompiler from "gulp-typescript";

const { src, dest } = gulpPackage;

const typescriptProject = typescriptCompiler.createProject("tsconfig.json");

const compileTypescript = () =>
  src("./src/**/*.ts").pipe(typescriptProject()).pipe(dest("./build"));

export const build = compileTypescript;
