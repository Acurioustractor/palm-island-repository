export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#0B4F6C]/20 border-t-[#0B4F6C] rounded-full animate-spin" />
        <p className="mt-4 text-[#2D2319]/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}
