import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="bg-white flex min-h-screen flex-col items-center justify-between">
      <ChatInterface vendorId="id_a" />
    </main>
  );
}
