const tf = require("@tensorflow/tfjs-node");

class PredictService {
  async predictImage(photo) {
    try {
      // Use path.join for cross-platform compatibility
      const modelPath = "file://model/model.json";
      const model = await tf.loadGraphModel(modelPath);
      let imageBuffer;
      if (photo && photo._data) {
        imageBuffer = photo._data;
      } else if (Buffer.isBuffer(photo)) {
        imageBuffer = photo;
      } else {
        const buffers = [];
        for await (const data of photo) {
          buffers.push(data);
        }
        imageBuffer = Buffer.concat(buffers);
      }

      console.log("Processing image...");
      const tensor = tf.tidy(() => {
        const decodedImage = tf.node.decodeImage(imageBuffer, 3);
        const resizedImage = tf.image.resizeBilinear(decodedImage, [224, 224]);
        const expandedImage = resizedImage.expandDims(0);
        return expandedImage.div(255.0);
      });

      console.log("Making prediction...");
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
    } catch (error) {
      console.error("Prediction error:", error);
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      throw new Error(`Prediction failed: ${error.message}`);
      console.log("Prediction failed:", error);
    }
  }
}

module.exports = PredictService;
