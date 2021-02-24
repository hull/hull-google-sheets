// const _ = require("lodash");

function statusCheckAction(req, res) {
  const { ship = {}, client = {}, /* shipApp = {} */ } = req.hull;
  const messages = [];
  const status = "ok";
  res.json({ status, messages });
  return client.put(`${ship.id}/status`, { status, messages });
}

module.exports = statusCheckAction;
