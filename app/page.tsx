import CPUScheduler from "@/components/cpu-scheduler"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <div className="flex-1">
        <CPUScheduler />
      </div>
      <Footer />
    </main>
  )
}
