import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dictionary',
  description: 'Manage and practice your English vocabulary.',
};

export default function DictionaryPage() {
  return (
    <main>
      <div className="container">
        <h1>Dictionary</h1>
      </div>
    </main>
  );
}