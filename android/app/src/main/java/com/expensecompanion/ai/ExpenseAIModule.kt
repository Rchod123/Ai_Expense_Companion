package com.expensecompanion.ai

import android.util.Log

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONObject
import org.pytorch.executorch.Module
import org.pytorch.executorch.EValue
import org.pytorch.executorch.Tensor

class ExpenseAIModule(
    reactContext: ReactApplicationContext
) : NativeExpenseAISpec(reactContext) {

    private var module: Module? = null

    override fun getName(): String {
        return NAME
    }

    private fun loadVocabulary(): Map<String, Int> {

        val jsonText = reactApplicationContext.assets
        .open("vocab.json")
        .bufferedReader()
        .use {
            it.readText()
        }

        val jsonObject = JSONObject(jsonText)

        val vocabulary = mutableMapOf<String, Int>()

        val keys = jsonObject.keys()

        while (keys.hasNext()) {

            val word = keys.next()

            val index = jsonObject.getInt(word)

            vocabulary[word] = index
        }

        return vocabulary
    }

private fun textToVector(
    text: String,
    vocabulary: Map<String, Int>
): FloatArray {

    val vector = FloatArray(
        vocabulary.size
    )

    val tokens = text
        .lowercase()
        .split("\\s+".toRegex())

    for (token in tokens) {

        val vocabularyIndex = vocabulary[token]

        if (vocabularyIndex != null) {

            val index = vocabularyIndex - 1

            if (index >= 0 && index < vector.size) {

                vector[index] += 1.0f
            }
        }
    }

    return vector
}

private fun testTokenizer(
    description: String
) {

    val vocabulary = loadVocabulary()

    val vector = textToVector(
        description,
        vocabulary
    )

    Log.d(
        "ExpenseAI",
        "Vocabulary size: ${vocabulary.size}"
    )

    Log.d(
        "ExpenseAI",
        "Input vector size: ${vector.size}"
    )

    Log.d(
        "ExpenseAI",
        "Input vector: ${vector.contentToString()}"
    )
}

    private fun copyModelFromAssets(): String {

        val modelFile = java.io.File(
            reactApplicationContext.filesDir,
            "expense_classifier.pte"
        )

        if (!modelFile.exists()) {

            reactApplicationContext.assets
                .open("expense_classifier.pte")
                .use { input ->

                    modelFile.outputStream().use { output ->

                        input.copyTo(output)
                    }
                }
        }

        return modelFile.absolutePath
    }

    private fun loadModel(): Module {

        if(module == null){
            val modelPath = copyModelFromAssets()
            Log.d("ExpenseAI","Loading ExecuTorch model...")
            module = Module.load(modelPath)
            Log.d("ExpenseAI","ExecuTorch model loaded")
        }

        return module !!
    }

private fun runInference(
    inputVector: FloatArray
): FloatArray {

    val module = loadModel()

        val inputTensor = Tensor.fromBlob(
            inputVector,
            longArrayOf(
                1,
                inputVector.size.toLong()
            )
        )

        val inputValue = EValue.from(
            inputTensor
        )

        val outputs = module.forward(
            inputValue
        )

        val outputTensor = outputs[0].toTensor()

        val logits = outputTensor.dataAsFloatArray

        Log.d(
            "ExpenseAI",
            "Output size: ${logits.size}"
        )

        return logits
}

override fun invalidate() {

    module?.close()

    module = null

    super.invalidate()
}


private fun argmax(
    values: FloatArray
): Int {

    var maxIndex = 0
    var maxValue = values[0]

    for (i in 1 until values.size) {

        if (values[i] > maxValue) {

            maxValue = values[i]
            maxIndex = i
        }
    }

    return maxIndex
}

private fun softmax(
    logits: FloatArray
): FloatArray {

    var maxLogit = logits[0]

    for (value in logits) {
        maxLogit = maxOf(maxLogit, value)
    }

    val probabilities = FloatArray(logits.size)

    var sum = 0.0

    for (i in logits.indices) {

        val value = kotlin.math.exp(
            (logits[i] - maxLogit).toDouble()
        )

        probabilities[i] = value.toFloat()
        sum += value
    }

    for (i in probabilities.indices) {

        probabilities[i] = (
            probabilities[i].toDouble() / sum
        ).toFloat()
    }

    return probabilities
}

private fun predictCategory(
    logits: FloatArray
): Pair<Int, Float> {

    val probabilities = softmax(
        logits
    )

    val predictedIndex = argmax(
        probabilities
    )

    val confidence =
        probabilities[predictedIndex]

    return Pair(
        predictedIndex,
        confidence
    )
}

private fun loadCategories(): List<String> {

    val jsonText = reactApplicationContext.assets
        .open("categories.json")
        .bufferedReader()
        .use {
            it.readText()
        }

    val jsonArray = org.json.JSONArray(jsonText)

    val categories = mutableListOf<String>()

    for (i in 0 until jsonArray.length()) {
        categories.add(
            jsonArray.getString(i)
        )
    }

    return categories
}

    override fun predict(
        description: String,
        promise: Promise
    ) {

        try {

            Log.d(
                "ExpenseAI",
                "Input: $description"
            )

            // Only testing model loading for now.
            val vocab = loadVocabulary()
            val vector = textToVector(
                description,
                vocab
            )

            Log.d(
                "ExpenseAI",
                "Vocabulary size: ${vocab.size}"
            )

            Log.d(
                "ExpenseAI",
                "Input vector size: ${vector.size}"
            )

            val logits = runInference(
                vector
            )

            val (predictedIndex,confidence) = predictCategory(
                logits
            )
            Log.d(
                "ExpenseAI",
                "Predicted index: $predictedIndex"
            )

            Log.d(
                "ExpenseAI",
                "Confidence: $confidence"
            )
            // Keep our known-good hardcoded response.
            val categories = loadCategories()
            if (
                predictedIndex < 0 ||
                predictedIndex >= categories.size
            ) {

                throw IllegalStateException(
                    "Invalid category index: $predictedIndex"
                )
            }
            val result = WritableNativeMap()
            val category = categories[predictedIndex]
            result.putString(
                "category",
                category
            )

            result.putDouble(
                "confidence",
                confidence.toDouble() * 100
            )

            result.putInt(
                "classIndex",
                predictedIndex
            )

            promise.resolve(
                result
            )

        } catch (e: Exception) {

            Log.e(
                "ExpenseAI",
                "ExecuTorch error",
                e
            )

            promise.reject(
                "EXPENSE_AI_ERROR",
                e.message,
                e
            )
        }
    }

    companion object {
        const val NAME = "NativeExpenseAI"
    }
}