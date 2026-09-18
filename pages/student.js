import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES, formatINR } from "../lib/categories";
import SplitBar from "../components/SplitBar";
import CategoryCard from "../components/CategoryCard";

export default function Student() {
  const router = useRouter();
  const { code } = router.query;
  const [famDoc, setFamDoc] = useState(undefined);

  useEffect(() => {
    if (!code) return;
    const ref = doc(db, "families", code);
    const unsub = onSnapshot(ref, (snap) => {
      setFamDoc(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [code]);

  if (!code || famDoc === undefined) {
    return <div className="max-w-md mx-auto min-h-screen px-5 py-8 text-center text-muted">Load ho raha hai...</div>;
  }

  if (famDoc === null) {
    return (
      <div className="max-w-md mx-auto min-h-screen px-5 py-8">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <h2 className="font-semibold mb-2">Abhi setup baaki hai</h2>
          <p className="text-muted text-sm mb-4">
            Apne parent ko yeh code dein aur unse pocket money set karne ko kahein:
          </p>
          <div className="text-2xl font-bold tracking-widest bg-surface2 border border-dashed border-border rounded-xl py-4">
            {code}
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard code={code} famDoc={famDoc} />;
}

function Dashboard({ code, famDoc }) {
  const [cat, setCat] = useState("emergency");
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [warn, setWarn] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  async function logSpend() {
    setWarn("");
    const value = parseFloat(amt);
    if (!value || value <= 0) {
      setWarn("Sahi amount daalein.");
      return;
    }
    const allocAmt = (famDoc.pocketMoney * famDoc.allocation[cat]) / 100;
    const remAmt = allocAmt - (famDoc.spent[cat] || 0);
    if (value > remAmt) {
      setWarn(`Is category mein sirf ${formatINR(remAmt)} bacha hai - phir bhi log kiya ja raha hai.`);
    }
    const newSpent = { ...famDoc.spent, [cat]: (famDoc.spent[cat] || 0) + value };
    const newTx = (famDoc.transactions || []).concat([
      { id: Date.now(), category: cat, amount: value, note, ts: Date.now() }
    ]);
    await updateDoc(doc(db, "families", code), {
      spent: newSpent,
      transactions: newTx,
      updatedAt: Date.now()
    });
    setAmt("");
    setNote("");
  }

  async function askAi() {
    if (!question.trim()) {
      setAnswer("Pehle sawaal likhein.");
      return;
    }
    setAsking(true);
    setAnswer("");
    const walletSummary = CATEGORIES.map((c) => {
      const allocAmt = (famDoc.pocketMoney * famDoc.allocation[c.key]) / 100;
      const remAmt = allocAmt - (famDoc.spent[c.key] || 0);
      return `${c.label}: ${formatINR(remAmt)} bacha (total ${formatINR(allocAmt)})`;
    }).join(", ");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, walletSummary })
      });
      const data = await res.json();
      setAnswer(data.text);
    } catch (e) {
      setAnswer("Abhi jawab nahi mil paya, dobara try karein.");
    }
    setAsking(false);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 py-8">
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <p className="text-muted text-sm">Tumhari pocket money</p>
        <div className="text-4xl font-bold">{formatINR(famDoc.pocketMoney)}</div>
        <SplitBar allocation={famDoc.allocation} />
      </div>

      {CATEGORIES.map((c) => (
        <CategoryCard
          key={c.key}
          cat={c}
          allocAmt={(famDoc.pocketMoney * famDoc.allocation[c.key]) / 100}
          spentAmt={famDoc.spent[c.key] || 0}
          mode="student"
        />
      ))}

      <div className="bg-surface border border-border rounded-2xl p-6 my-4">
        <h3 className="font-semibold mb-3">Kharcha log karein</h3>
        <label className="block text-xs text-muted mb-1.5">Category</label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full rounded-lg px-3 py-2.5 mb-4">
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="block text-xs text-muted mb-1.5">Amount</label>
        <input
          type="number"
          value={amt}
          onChange={(e) => setAmt(e.target.value)}
          placeholder="jaise: 150"
          className="w-full rounded-lg px-3 py-2.5 mb-4"
        />
        <label className="block text-xs text-muted mb-1.5">Kis liye? (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="jaise: movie ticket"
          className="w-full rounded-lg px-3 py-2.5 mb-4"
        />
        <button onClick={logSpend} className="w-full bg-saving text-[#08281D] font-bold py-3 rounded-xl">
          Log karein
        </button>
        {warn && <p className="text-emergency text-xs mt-2">{warn}</p>}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-1">AI se pucho</h3>
        <p className="text-muted text-sm mb-3">jaise: "Kya main ₹500 ke sneakers le sakta hoon?"</p>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Apna sawaal likhein..."
          className="w-full rounded-lg px-3 py-2.5 mb-3"
        />
        <button onClick={askAi} disabled={asking} className="w-full border border-border rounded-xl py-2.5 font-semibold disabled:opacity-50">
          {asking ? "Soch raha hoon..." : "Pucho"}
        </button>
        {answer && <div className="bg-surface2 border border-border rounded-xl p-3 text-sm mt-3">{answer}</div>}
      </div>
    </div>
  );
}
