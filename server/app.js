import express from "express";
import jwt from "jwt-simple";
import _ from "lodash";
import bodyParser from "body-parser";

import devMode from "./dev-mode";
import statusCheckAction from "./status";

export default function (connector, options = {}) {
  const app = express();
  if (options.devMode) devMode(app);

  const { hostSecret, installUrl } = options;
  connector.setupApp(app);

  app.post("/status", statusCheckAction);
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

  const READ_ONLY_ATTRIBUTES = [
    "anonymous_ids",
    "event",
    "first_seen_at",
    "id",
    "is_approved",
    "last_known_ip",
  ];


  app.get("/schema/fields", (req, res) => {
    if (!req.hull.client) {
      return res.status(401).json({ error: "No hull client found !" });
    }
    return req.hull.client.get("users/schema").then((schema) => {
      const keys = _.omitBy(_.map(schema, "key"), k => {
        return _.includes(READ_ONLY_ATTRIBUTES, k) ||
                k.match(/^account\.|^latest_session|^first_session|^signup_session/);
      });
      const fields = _.uniq(_.map(keys,
        p => p.toString().replace(/^traits_/, "")
      )).sort();
      res.json(fields);
    }).catch(err => {
      const { message, stack } = err || {};
      res.status(500).json({ error: message, stack });
    });
  });

  app.get("/admin.html", (req, res) => {
    const config = _.pick(req.hull.client.configuration(), "id", "secret", "organization");
    config.ship = config.id;
    res.render("admin.html", {
      installUrl,
      token: jwt.encode(config, hostSecret)
    });
  });

  app.get("/sidebar.html", (req, res) => {
    res.render("sidebar.html");
  });

  return app;
}
