"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { MessageSquare, ArrowUp } from "lucide-react"

type PageParams = { id: string }
type PageProps = { params: PageParams }

const mockInitialSeries = () => {
  const now = Date.now()
  return Array.from({ length: 30 }).map((_, i) => ({
    time: new Date(now - (29 - i) * 1000 * 60).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    yes: Math.min(0.95, Math.max(0.05, 0.5 + Math.sin(i / 5) * 0.12 + (Math.random() - 0.5) * 0.06)),
    no: 1 - (Math.min(0.95, Math.max(0.05, 0.5 + Math.sin(i / 5) * 0.12 + (Math.random() - 0.5) * 0.06))),
  }))
}

function MarketDetailPage({ params }: PageProps) {
  const marketId = params.id

  const [series, setSeries] = useState(() => mockInitialSeries())
  const [isLive, setIsLive] = useState(true)
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO">("YES")
  const [stakeAmount, setStakeAmount] = useState<number>(10)
  const [positions, setPositions] = useState(() => [
    { name: "alice", side: "YES", amount: 1250 },
    { name: "bob", side: "NO", amount: 980 },
    { name: "carol", side: "YES", amount: 760 },
    { name: "dave", side: "NO", amount: 420 },
  ])
  const [comments, setComments] = useState(() => [
    { id: 1, author: "alice", text: "I like the fundamentals here.", ts: Date.now() - 1000 * 60 * 30 },
    { id: 2, author: "bob", text: "Odds seem off to me.", ts: Date.now() - 1000 * 60 * 10 },
  ])
  const [newComment, setNewComment] = useState("")

  const [resolved, setResolved] = useState(false)
  const [winningSide, setWinningSide] = useState<"YES" | "NO" | null>(null)

  // simulate live updates
  useEffect(() => {
    if (!isLive) return
    const id = setInterval(() => {
      setSeries((s) => {
        const last = s[s.length - 1]
        const nextYes = Math.min(0.98, Math.max(0.02, last.yes + (Math.random() - 0.48) * 0.02))
        const next = {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          yes: nextYes,
          no: 1 - nextYes,
        }
        const nextSeries = [...s.slice(-199), next]
        return nextSeries
      })
    }, 3500)
    return () => clearInterval(id)
  }, [isLive])

  const chartData = useMemo(
    () => series.map((p) => ({ time: p.time, yes: +(p.yes * 100).toFixed(2) })),
    [series]
  )

  function handleStake() {
    // optimistic local update
    setPositions((p) => {
      const copy = [...p]
      copy.push({ name: "you", side: selectedSide, amount: stakeAmount })
      copy.sort((a, b) => b.amount - a.amount)
      return copy.slice(0, 10)
    })
    setStakeAmount(10)
  }

  function handleAddComment() {
    if (!newComment.trim()) return
    setComments((c) => [...c, { id: Date.now(), author: "you", text: newComment.trim(), ts: Date.now() }])
    setNewComment("")
  }

  function handleResolve(side: "YES" | "NO") {
    setResolved(true)
    setWinningSide(side)
    setIsLive(false)
  }

  function handleClaim() {
    // simple simulation: if you staked on winning side you can claim
    const you = positions.find((p) => p.name === "you")
    const canClaim = resolved && winningSide && you && you.side === winningSide
    if (canClaim) {
      // simulate payout by removing your position and showing a tiny toast (console)
      setPositions((p) => p.filter((x) => x.name !== "you"))
      // eslint-disable-next-line no-console
      console.log("Payout claimed:", you.amount)
      alert(`Payout claimed: ${you.amount}`)
    } else {
      alert("No payout available for your positions.")
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-slate-200">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Market — {marketId ?? "..."}</h1>
            <p className="text-slate-400 mt-1">Short description or subtitle for this market goes here.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-md bg-slate-800/50 text-slate-300 flex items-center gap-2">
              <ArrowUp size={16} /> Live
            </div>
            <div className="px-3 py-1 rounded-md bg-slate-800/40 text-slate-300">ID: {marketId ?? "—"}</div>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            {/* Metadata card */}
            <div className="rounded-xl bg-gradient-to-br from-stone-900/40 to-slate-900/30 p-6 border border-slate-800">
              <h2 className="text-xl font-semibold">Question</h2>
              <p className="text-slate-300 mt-2">Will project X reach $10 by 2026-12-31?</p>
              <h3 className="text-sm text-slate-400 mt-4">Resolution Criteria</h3>
              <p className="text-slate-400 text-sm">Price must be verified on-chain and on the mainnet oracle by 2026-12-31 23:59 UTC.</p>
            </div>

            {/* Chart card */}
            <div className="rounded-xl bg-gradient-to-br from-slate-900/50 to-black p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Yes/No Probability (Historical)</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsLive((v) => !v)}
                    className="px-3 py-1 rounded bg-slate-800/50 hover:bg-slate-700/40"
                  >
                    {isLive ? "Pause" : "Resume"}
                  </button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 24, left: 8, bottom: 6 }}>
                    <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fill: "#94a3b8" }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#94a3b8" }} />
                    <Tooltip formatter={(value: number | string) => `${value}%`} />
                    <Line type="monotone" dataKey="yes" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <div>Latest: <span className="text-slate-100">{chartData[chartData.length - 1]?.yes ?? 0}% YES</span></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400" /> YES
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-red-400" /> NO
                  </div>
                </div>
              </div>
            </div>

            {/* Comments thread */}
            <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Discussion</h4>
                <div className="text-slate-400 text-sm flex items-center gap-2"><MessageSquare size={16}/> {comments.length}</div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-md bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{c.author}</div>
                      <div className="text-xs text-slate-500">{new Date(c.ts).toLocaleString()}</div>
                    </div>
                    <div className="text-slate-300 mt-1 text-sm">{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-600"
                />
                <button onClick={handleAddComment} className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold">Post</button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {/* Stake card */}
            <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800">
              <h4 className="font-medium mb-2">Stake</h4>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSelectedSide("YES")}
                  className={`flex-1 py-2 rounded-lg font-semibold ${selectedSide === "YES" ? "bg-green-500 text-black" : "bg-slate-800/40 text-slate-200"}`}
                >
                  YES
                </button>
                <button
                  onClick={() => setSelectedSide("NO")}
                  className={`flex-1 py-2 rounded-lg font-semibold ${selectedSide === "NO" ? "bg-red-500 text-black" : "bg-slate-800/40 text-slate-200"}`}
                >
                  NO
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-28 bg-transparent border border-slate-800 rounded px-3 py-2 text-sm"
                />
                <button onClick={handleStake} className="ml-auto px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold">Stake</button>
              </div>
            </div>

            {/* Positions table */}
            <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Top Stakers</h4>
                <div className="text-sm text-slate-500">Total: {positions.reduce((s, p) => s + p.amount, 0)}</div>
              </div>
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-slate-400 text-xs">
                    <th className="text-left pb-2">User</th>
                    <th className="text-left pb-2">Side</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={`${p.name}-${i}`} className="border-t border-slate-800/60">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${p.side === "YES" ? "bg-green-600 text-black" : "bg-red-600 text-black"}`}>{p.side}</span>
                      </td>
                      <td className="py-2 text-right font-mono">{p.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resolution / Claim card */}
            <div className="rounded-xl bg-slate-900/40 p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Resolution</h4>
                <div className="text-sm text-slate-400">Status: {resolved ? "Resolved" : "Open"}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleResolve("YES")} className="flex-1 py-2 rounded bg-green-600 font-semibold">Resolve YES</button>
                <button onClick={() => handleResolve("NO")} className="flex-1 py-2 rounded bg-red-600 font-semibold">Resolve NO</button>
              </div>
              <div className="pt-2 flex gap-2">
                <button onClick={handleClaim} className="flex-1 py-2 rounded bg-amber-500 font-semibold">Claim Payout</button>
                <button onClick={() => { setResolved(false); setWinningSide(null); setIsLive(true) }} className="flex-1 py-2 rounded bg-slate-800/50">Reset</button>
              </div>
              {resolved && winningSide && (
                <div className="mt-2 text-sm text-slate-300">Winning side: <span className="font-semibold ml-1">{winningSide}</span></div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default MarketDetailPage
