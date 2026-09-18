import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES, formatINR } from "../lib/categories";
import SplitBar from "../components/SplitBar";
import CategoryCard from "../components/CategoryCard";

export default function Parent() {
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

  if (!code || famDoc === undefined) return <Loading />;
  if (famDoc === null) return <SetupForm code={code} />;
  return <Dashboard code={code} famDoc={famDoc} />;
}

function Loading() {
  return (
    <div className="max-w-md mx-auto min-h-screen px-5 py-8 text-center text-muted">
      Load ho raha hai...
    </div>
  );
}

function SetupForm({ code }) {
  const [amount, setAmount] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [vals, setVals] = useState(null);

  async function getAiSplit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      alert("Sahi amount daalein");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, context })
      });
      const data = await res.json();
      setSuggestion(data);
      setVals({ emergency: data.emergency, saving: data.saving, enjoyment: data.enjoyment });
    } catch (e) {
      alert("Kuch gadbad hui, dobara try karein.");
    }
    setLoading(false);
  }

  function updateVal(key, value) {
    const others = CATEGORIES.map((c) => c.key).filter((k) => k !== key);
    const remaining = 100 - value;
    const otherTotal = others.reduce((s, k) => s + vals[k], 0);
    const next = { ...vals, [key]: value };
    let running = 0;
    others.forEach((k, idx) => {
      let v =
        otherTotal > 0
          ? Math.round((remaining * vals[k]) / otherTotal)
          : Math.round(remaining / others.length);
      if (idx === others.length - 1) v = remaining - running;
      running += v;
      next[k] = v;
    });
    setVals(next);
  }

  async function confirm() {
    const amt = parseFloat(amount);
    const payload = {
      pocketMoney: amt,
      allocation: vals,
      aiNote: suggestion.note || "",
      context: context || "",
      spent: { emergency: 0, saving: 0, enjoyment: 0 },
      transactions: [],
      updatedAt: Date.now()
    };
    await setDoc(doc(db, "families", code), payload);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 py-8">
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <h2 className="text-lg font-semibold mb-1">Pocket money set karein</h2>
        <p className="text-muted text-sm mb-4">
          Family code: <b>{code}</b> - bachche ko yeh code share karein.
        </p>
        <label className="block text-xs text-muted mb-1.5">Is mahine ki pocket money</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="jaise: 2000"
          className="w-full rounded-lg px-3 py-2.5 mb-4"
        />
        <label className="block text-xs text-muted mb-1.5">Koi context? (optional)</label>
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="jaise: exam season, festival month"
          className="w-full rounded-lg px-3 py-2.5 mb-4"
        />
        <button
          onClick={getAiSplit}
          disabled={loading}
          className="w-full bg-saving text-[#08281D] font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Soch raha hoon..." : "AI se split suggest karayein"}
        </button>
      </div>

      {suggestion && vals && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-1">AI suggestion</h3>
          <SplitBar allocation={vals} />
          <div className="bg-saving/10 border border-saving rounded-xl p-3 text-sm mt-3">
            <b className="text-saving">Kyun:</b> {suggestion.note}
          </div>
          <div className="mt-5 space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span>{cat.label}</span>
                  <span>
                    {vals[cat.key]}% - {formatINR((parseFloat(amount) * vals[cat.key]) / 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vals[cat.key]}
                  onChange={(e) => updateVal(cat.key, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <button onClick={confirm} className="w-full bg-saving text-[#08281D] font-bold py-3 rounded-xl mt-5">
            Confirm aur bachche ko bhejein
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard({ code, famDoc }) {
  const totalSpent = CATEGORIES.reduce((s, c) => s + (famDoc.spent[c.key] || 0), 0);
  const txList = (famDoc.transactions || []).slice().reverse().slice(0, 8);

  async function newCycle() {
    if (confirm("Naya cycle shuru karein? Purana data reset ho jayega.")) {
      await deleteDoc(doc(db, "families", code));
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 py-8">
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <p className="text-muted text-sm mb-0.5">Family code</p>
        <h2 className="text-xl font-bold mb-3 tracking-wide">{code}</h2>
        <p className="text-muted text-sm">Is mahine ki pocket money</p>
        <div className="text-4xl font-bold">{formatINR(famDoc.pocketMoney)}</div>
        <SplitBar allocation={famDoc.allocation} />
        {famDoc.aiNote && (
          <div className="bg-saving/10 border border-saving rounded-xl p-3 text-sm mt-3">
            <b className="text-saving">AI ne kaha:</b> {famDoc.aiNote}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <h3 className="font-semibold mb-3">Category-wise status</h3>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            cat={cat}
            allocAmt={(famDoc.pocketMoney * famDoc.allocation[cat.key]) / 100}
            spentAmt={famDoc.spent[cat.key] || 0}
            mode="parent"
          />
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <h3 className="font-semibold mb-3">Recent activity</h3>
        {txList.length === 0 ? (
          <p className="text-muted text-sm">Abhi tak koi transaction nahi.</p>
        ) : (
          txList.map((tx) => {
            const cat = CATEGORIES.find((c) => c.key === tx.category) || CATEGORIES[0];
            return (
              <div key={tx.id} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <div className="text-sm">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ background: cat.hex }}
                  />
                  {tx.note || cat.label}
                </div>
                <span className="text-sm font-semibold">-{formatINR(tx.amount)}</span>
              </div>
            );
          })
        )}
      </div>

      <button onClick={newCycle} className="w-full border border-border rounded-xl py-3 font-semibold">
        Naya cycle shuru karein (naya amount set karein)
      </button>
    </div>
  );
}
