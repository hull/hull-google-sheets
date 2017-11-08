import Hull from "hull";
import app from "./app";

const options = {
  hostSecret: process.env.SECRET || "1234",
  devMode: process.env.NODE_ENV === "development",
  port: process.env.PORT || 8082,
  Hull,
  skipSignatureValidation: true
};

const connector = new Hull.Connector(options);
connector.startApp(app(connector, options));
