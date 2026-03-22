export default function ResultsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-5 w-24 rounded-full bg-ink/10" />
        <div className="h-14 max-w-2xl rounded-2xl bg-ink/10" />
        <div className="h-40 rounded-[2rem] bg-white" />
        <div className="h-64 rounded-[2rem] bg-white" />
        <div className="h-64 rounded-[2rem] bg-white" />
      </div>
    </div>
  );
}
