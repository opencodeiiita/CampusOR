import Link from "next/link";
import Kiosk from "../../../components/kiosk/Kiosk";

type PageProps = {
  searchParams?: { queueId?: string };
};

export default function KioskPage({ searchParams }: PageProps) {
  const queueId = searchParams?.queueId;

  if (!queueId) {
    return (
      <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Select a queue to view the kiosk display
          </h1>
         
          <div className="flex justify-center gap-3">
            <Link
              href="/queue"
              className="rounded-full bg-slate-900 px-4 py-2 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              View Queues
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <Kiosk queueId={queueId} />
    </main>
  );
}

