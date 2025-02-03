import cors from "cors";
import express, { type Request, type Response } from "express";
import { jsonController } from "./json.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message:
      "This is the API that converts unstructured data into the exact JSON format provided in the attachment.",
  });
});

app.post("/api/json", jsonController);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
