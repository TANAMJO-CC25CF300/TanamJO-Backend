const tf = require("@tensorflow/tfjs-node");

class PredictService {
  async predictImage(photo) {
    const modelPath = "file://model/model.json";
    const model = await tf.loadLayersModel(modelPath);
    console.log("photo:", photo);
    console.log("photo type:", typeof photo);
    let imageBuffer;
    if (photo && photo._data) {
      imageBuffer = photo._data;
      console.log(
        "Photo is a Readable Stream with _data Buffer, using _data as Buffer"
      );
    } else if (Buffer.isBuffer(photo)) {
      imageBuffer = photo;
      console.log("Photo is a Buffer");
    } else {
      const buffers = [];
      for await (const data of photo) {
        buffers.push(data);
      }
      imageBuffer = Buffer.concat(buffers);
      console.log("Photo is a Stream, converted to Buffer");
    }

    console.log(imageBuffer);

    const tensor = tf.node
      .decodeImage(imageBuffer, 3)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const predict = await model.predict(tensor);
    const score = await predict.data();
    const confidenceScore = Math.max(...score);
    const label = tf.argMax(predict, 1).dataSync()[0];

    const diseaseLabels = [
      "Tomato Spider mites Two spotted spider mite",
      "Tomato Tomato mosaic virus ",
      "Tomato Leaf Mold",
      "Tomato Early blight",
      "Tomato Late blight",
      "Tomato Septoria leaf spot",
      "Tomato Bacterial spot",
      "Tomato Target Spot",
      "Tomato Healthy",
    ];
    const diseaseLabel = diseaseLabels[label];

    return { confidenceScore, diseaseLabel };
  }
}

module.exports = PredictService;
