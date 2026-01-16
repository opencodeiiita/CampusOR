import Kiosk from "../../../../components/kiosk/Kiosk";

type PageProps = {
  params: Promise<{ queueId: string }>;
};

export default async function KioskQueuePage({ params }: PageProps) {
  const { queueId } = await params;

  return (
    <main className="h-screen w-screen overflow-hidden">
      <Kiosk queueId={queueId} />
    </main>
  );
}
