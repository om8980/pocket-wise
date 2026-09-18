import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [code, setCode] = useState("");

  function pickRole(r) {
    setRole(r);
  }

  function createFamily() {
    const newCode = "FAM-" + Math.floor(1000 + Math.random() * 9000);
    goTo(newCode);
  }

  function joinFamily() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      alert("Code daalna zaroori hai");
      return;
    }
    goTo(trimmed);
  }

  function goTo(finalCode) {
    router.push(`/${role}?code=${encodeURIComponent(finalCode)}`);
  }

  if (!role) {
    return (
      <div className="max-w-md mx-auto min-h-screen px-5 py-8">
        <Header />
        <div className="bg-surface border border-border rounded-2xl p-7 text-center">
          <h1 className="text-xl font-bold mb-2">Pocket money, sorted by AI</h1>
          <p className="text-muted text-sm mb-6">
            Emergency, saving aur enjoyment mein smart split - har mahine, bina jhagde ke.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => pickRole("parent")}
              className="flex-1 bg-enjoyment text-[#3A2E0C] font-bold py-3 rounded-xl"
            >
              Main Parent hoon
            </button>
            <button
              onClick={() => pickRole("student")}
              className="flex-1 bg-saving text-[#08281D] font-bold py-3 rounded-xl"
            >
              Main Student hoon
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 py-8">
      <Header />
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-1">
          {role === "parent" ? "Family banayein ya connect karein" : "Family code daalein"}
        </h2>
        <p className="text-muted text-sm mb-4">
          {role === "parent"
            ? "Ek code milega - apne bachche ko bhej dein."
            : "Yeh code aapke parent ne banaya hoga."}
        </p>
        {role === "parent" && (
          <>
            <button
              onClick={createFamily}
              className="w-full bg-saving text-[#08281D] font-bold py-3 rounded-xl mb-3"
            >
              Naya family code banayein
            </button>
            <p className="text-muted text-sm text-center my-3">- ya code se connect karein -</p>
          </>
        )}
        <label className="block text-xs text-muted mb-1.5">Family code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="jaise: FAM-4821"
          className="w-full rounded-lg px-3 py-2.5 mb-4 uppercase"
        />
        <button onClick={joinFamily} className="w-full border border-border rounded-xl py-3 font-semibold">
          Connect
        </button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saving to-enjoyment" />
      <span className="font-bold text-lg">PocketWise</span>
    </div>
  );
}
