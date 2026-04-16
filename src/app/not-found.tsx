import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col items-center justify-center p-4 relative overflow-hidden text-center">
      {/* Background decoration */}
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <div className="relative">
          <h1 className="text-[150px] font-black text-white/5 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🔍</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Opa! Página não encontrada</h2>
          <p className="text-[#9296ab] text-sm sm:text-base leading-relaxed">
            Parece que você se perdeu na escala. Mas não se preocupe, o som ainda está rolando! Clique no botão abaixo para voltar ao início.
          </p>
        </div>

        <Link 
          href="/" 
          className="mt-4 px-8 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-xl shadow-violet-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
