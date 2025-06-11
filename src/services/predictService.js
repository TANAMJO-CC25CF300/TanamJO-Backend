const tf = require("@tensorflow/tfjs-node");

class PredictService {
  async predictImage(photo) {
    const modelPath = "file://model/model.json";
    const model = await tf.loadGraphModel(modelPath);
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

    const predict = await model.executeAsync(tensor);
    const outputTensor = Array.isArray(predict) ? predict[0] : predict;
    const score = await outputTensor.data();
    const confidenceScore = Math.max(...score);
    const label = score.indexOf(confidenceScore);

    const diseaseLabels = [
      "Bacterial_spot",
      "Early_blight",
      "Late_blight",
      "Leaf_Mold",
      "Septoria_leaf_spot",
      "Spider_mites Two-spotted_spider_mite",
      "Target_Spot",
      "Tomato_Yellow_Leaf_Curl_Virus",
      "Tomato_mosaic_virus",
      "healthy",
      "powdery_mildew",
    ];
    const diseaseLabel = diseaseLabels[label];

    // Cleanup
    tf.dispose([tensor, predict, outputTensor]);

    return { confidenceScore, diseaseLabel };
  }
  catch(error) {
    console.error("Prediction error:", error);
    // Log more detailed error information
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

module.exports = PredictService;
