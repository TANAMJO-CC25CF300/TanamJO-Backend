const tf = require("@tensorflow/tfjs-node");

class PredictService {
  async predictImage(photo) {
    const modelPath = "file://model/model.json";
    const model = await tf.loadLayersModel(modelPath);
    const buffers = [];

    for await (const data of photo) {
      buffers.push(data);
    }

    const image = Buffer.concat(buffers);

    const tensor = tf.node
      .decodeImage(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const predict = await model.predict(tensor);
    const score = await predict.data();
    const confidenceScore = Math.max(...score);
    const label = tf.argMax(predict, 1).dataSync()[0];

    const diseaseLabels = [
      "Melanocytic nevus",
      "Squamous cell carcinoma",
      "Vascular lesion",
    ];
    const diseaseLabel = diseaseLabels[label];

    return { confidenceScore, diseaseLabel };
  }
}

module.exports = PredictService;
