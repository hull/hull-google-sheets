import express from "express";
import devMode from "./dev-mode";
import jwt from "jwt-simple";
import _ from "lodash";
import bodyParser from "body-parser";

export default function (connector, options = {}) {
  const app = express();
  if (options.devMode) devMode(app);

  const { hostSecret } = options;
  connector.setupApp(app);

  app.post("/import", bodyParser.json(), (req, res) => {
    const hull = req.hull.client;
    if (req.body && req.body.rows) {
      req.body.rows.forEach(({ ident, traits }) => {
        const user = hull.asUser(ident);
        return user.traits(traits).then(
          () => user.logger.info("incoming.user.success", { traits }),
          err => user.logger.info("incoming.user.error", { message: _.get(err, "message") }),
        );
      });
    }
    res.json({ ok: true });
  });

  app.get("/schema/fields", (req, res) => {
    if (!req.hull.client) {
      return res.status(401).json({ error: "No hull client found !" });
    }
    return req.hull.client.get("search/user_report/properties").then(
      (properties = {}) => {
        try {
          res.json(Object.keys(properties));
        } catch (err) {
          const { message, stack } = err || {};
          res.status(500).json({ error: message, stack });
        }
      },
      err => {
        res.status(500).json({ error: err, message: err.message });
      }
    );
  });

  app.get("/admin.html", (req, res) => {
    const config = _.pick(req.hull.client.configuration(), "id", "secret", "organization");
    config.ship = config.id;
    res.render("admin.html", { config, hostSecret, token: jwt.encode(config, hostSecret) });
  });

  app.get("/sidebar.html", (req, res) => {
    res.render("sidebar.html");
  });

  return app;
}
