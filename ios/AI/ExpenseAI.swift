import Foundation
import ExecuTorch

@objc(ExpenseAI)
final class ExpenseAI: NSObject {

    @objc static let shared = ExpenseAI()

    private var module: Module?

    private var vocabulary: [String: Int]?
    private var categories: [String]?

    private func loadModel() throws -> Module {
        if let module { return module }
        guard let path = Bundle.main.path(forResource: "expense_classifier", ofType: "pte") else {
            throw ExpenseAIError.missingResource("expense_classifier.pte")
        }
        let model = Module(filePath: path)
        try model.load("forward")
        module = model
        print("✅ ExecuTorch model loaded successfully")
        return model
    }

    private func loadVocabulary() throws -> [String: Int] {
        if let vocabulary { return vocabulary }
        guard let url = Bundle.main.url(forResource: "vocab", withExtension: "json") else {
            throw ExpenseAIError.missingResource("vocab.json")
        }
        let loaded = try JSONDecoder().decode([String: Int].self, from: Data(contentsOf: url))
        vocabulary = loaded
        return loaded
    }

    private func loadCategories() throws -> [String] {
        if let categories { return categories }
        guard let url = Bundle.main.url(forResource: "categories", withExtension: "json") else {
            throw ExpenseAIError.missingResource("categories.json")
        }
        let loaded = try JSONDecoder().decode([String].self, from: Data(contentsOf: url))
        categories = loaded
        return loaded
    }

    @objc func predict(_ description: String) throws -> NSDictionary {
        let vocabulary = try loadVocabulary()
        var vector = Array(repeating: Float.zero, count: vocabulary.count)
        for token in description.lowercased().split(whereSeparator: { $0.isWhitespace }) {
            guard let index = vocabulary[String(token)].map({ $0 - 1 }), vector.indices.contains(index) else { continue }
            vector[index] += 1
        }
        let inputData = vector.withUnsafeBufferPointer { Data(buffer: $0) }
        let input = Tensor<Float>(data: inputData, shape: [1, vector.count])
        let outputs: [Value] = try loadModel().forward(input)
        guard let output: Tensor<Float> = outputs.first?.tensor() else {
            throw ExpenseAIError.invalidOutput
        }
        let logits = output.scalars()
        guard let maximum = logits.max() else { throw ExpenseAIError.invalidOutput }
        let exponentials = logits.map { Foundation.exp($0 - maximum) }
        let sum = exponentials.reduce(0, +)
        guard let index = exponentials.indices.max(by: { exponentials[$0] < exponentials[$1] }) else {
            throw ExpenseAIError.invalidOutput
        }
        let categories = try loadCategories()
        guard categories.indices.contains(index) else { throw ExpenseAIError.invalidOutput }
        return ["category": categories[index].trimmingCharacters(in: .whitespaces), "confidence": Double(exponentials[index] / sum * 100), "classIndex": index]
    }
}

private enum ExpenseAIError: LocalizedError {
    case missingResource(String), invalidOutput
    var errorDescription: String? {
        switch self {
        case .missingResource(let name): return "Missing bundled AI resource: \(name)"
        case .invalidOutput: return "The model returned an invalid prediction output."
        }
    }
}
