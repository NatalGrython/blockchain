import gulpPackage from "gulp";
import typescriptCompiler from "gulp-typescript";
import modifyCompiler from "gulp-modify-file";

const { src, dest, series } = gulpPackage;

const typescriptProject = typescriptCompiler.createProject("tsconfig.json");

const compileTypescript = () =>
  src("./lib/**/*.ts").pipe(typescriptProject()).pipe(dest("./build"));

const moveWorker = () =>
  src("./lib/block/worker.js")
    .pipe(
      modifyCompiler((content) =>
        content.replace('require("ts-node").register();', "")
      )
    )
    .pipe(dest("./build/block"));

export const build = series(compileTypescript, moveWorker);
