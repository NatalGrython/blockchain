import gulpPackage from "gulp";
import typescriptCompiler from "gulp-typescript";
import modifyCompiler from "gulp-modify-file";
import renameCompiler from "gulp-rename";

const { src, dest, series } = gulpPackage;

const typescriptProject = typescriptCompiler.createProject("tsconfig.json");

const compileTypescript = () =>
  src("./lib/**/*.ts")
    .pipe(
      modifyCompiler((content) =>
        content
          .replace('"./worker.js"', '"./worker.cjs"')
          .replace('"./proofOfWorkWorker.ts"', '"./proofOfWorkWorker.js"')
      )
    )
    .pipe(typescriptProject())
    .pipe(dest("./build"));

const moveWorker = () =>
  src("./lib/block/worker.js")
    .pipe(
      modifyCompiler((content) =>
        content
          .replace('require("ts-node").register();', "")
          .replace(
            "require(path.resolve(__dirname, workerData.path));",
            "import(path.resolve(__dirname, workerData.path));"
          )
      )
    )
    .pipe(renameCompiler((path) => (path.extname = ".cjs")))
    .pipe(dest("./build/block"));

export const build = series(compileTypescript, moveWorker);
