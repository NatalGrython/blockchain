import express from "express";
import bodyParser from "body-parser";
import coreRouter from "./routes";

const port = 5001;

const app = express();

app.use(bodyParser.json());

app.use("/", coreRouter);

app.listen(port, () => {
  console.log(`Server started http://localhost:${port}`);
});
