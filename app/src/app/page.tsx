import { PlatformStatusCard } from '@/components/PlatformStatus';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cosmos Solutions</p>
        <h1 className="mt-2 text-4xl font-semibold">Engineering Platform</h1>
        <p className="mt-3 text-base text-muted-foreground">
          The foundation is in place. The product lands on top of it.
        </p>
      </header>
      <PlatformStatusCard />
      <footer className="mt-12 text-center text-xs text-muted-foreground">
        <p>
          See <code className="font-mono">README.md</code> for the 30-minute quickstart and{' '}
          <code className="font-mono">docs/architecture.md</code> for the stack one-pager.
        </p>
      </footer>
    </main>
  );
}
