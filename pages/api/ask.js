export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, walletSummary } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: "Question required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ text: "AI abhi configure nahi hai." });
  }

  const prompt =
    `Student ka wallet: ${walletSummary}. Student puch raha hai: "${question}". ` +
    `Ek dost jaisa financial advisor bankar short (max 3 lines) advice do Hinglish mein - kya karna chahiye, ` +
    `kaunsi category se paisa nikale, aur agar budget kam hai to alternative suggest karo.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("");
    return res.status(200).json({ text: text.trim() });
  } catch (err) {
    return res.status(200).json({ text: "Abhi jawab nahi mil paya, dobara try karein." });
  }
}
