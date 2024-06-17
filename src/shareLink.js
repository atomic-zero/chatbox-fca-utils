"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function shareLink(text, url, threadID, callback) {
    if (!ctx.mqttClient) {
      throw new Error('Not connected to MQTT');
    }

    ctx.req_ID ??= 0;
    ctx.req_ID += 1;

    const resolveFunc = () => {};
    const rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    const queryPayload = {
      otid: utils.generateOfflineThreadingID(),
      source: 524289,
      sync_group: 1,
      send_type: 6,
      mark_thread_read: 0,
      url: url || "https://www.facebook.com/kemsadboiz",
      text: text || "",
      thread_id: threadID,
      initiating_source: 0
    };

    const query = {
      failure_count: null,
      label: 46,
      payload: JSON.stringify(queryPayload),
      queue_name: threadID,
      task_id: Math.random() * 1001 << 0,
    };

    const context = {
      app_id: '2220391788200892',
      payload: {
        tasks: [query],
        epoch_id: utils.generateOfflineThreadingID(),
        version_id: '7191105584331330',
      },
      request_id: ctx.req_ID,
      type: 3,
    };

    context.payload = JSON.stringify(context.payload);

    if (typeof callback === 'function') {
      ctx.callback_Task[ctx.req_ID] = { callback, type: "shareLink" };
    }

    ctx.mqttClient.publish('/ls_req', JSON.stringify(context), { qos: 1, retain: false });

    return returnPromise;
  };
};
