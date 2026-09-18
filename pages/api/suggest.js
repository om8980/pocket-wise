export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, context } = req.body || {};
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Valid amount required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      emergency: 30,
      saving: 40,
      enjoyment: 30,
      note: "Default balanced split (AI key configured nahi hai)."
    });
  }

  const prompt =
    `Student ko monthly pocket money mila hai \u20B9${amount}. ` +
    (context ? `Extra context: ${context}. ` : "") +
    `Ek behtareen budgeting AI ki tarah, isko emergency, saving aur enjoyment - teen categories mein divide karo. ` +
    `Emergency: unexpected zarurat ke liye. Saving: long-term goal ke liye. Enjoyment: mauj-masti/kharch ke liye. ` +
    `Default guideline 30/40/30 hai lekin context ke hisab se thoda adjust kar sakte ho (max 15 points idhar udhar). ` +
    `Sirf JSON return karo, bina kisi aur text ke: {"emergency": number, "saving": number, "enjoyment": number, "note": "1-2 line Hinglish reasoning"} - teeno percentages ka sum bilkul 100 hona chahiye.`;

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
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    const total = parsed.emergency + parsed.saving + parsed.enjoyment;
    if (Math.abs(total - 100) > 2) throw new Error("bad split");

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(200).json({
      emergency: 30,
      saving: 40,
      enjoyment: 30,
      note: "AI se jawab nahi mila, default balanced split use kiya gaya."
    });
  }
}
