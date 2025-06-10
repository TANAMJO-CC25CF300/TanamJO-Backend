const tf = require("@tensorflow/tfjs-node");

(async () => {
  const model = await tf.loadLayersModel("file://model/model.json");
  console.log("Model loaded!");
})();
