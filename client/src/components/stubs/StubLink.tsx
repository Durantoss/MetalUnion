import { useState } from 'react';
import { StubLinkProps, StubSubmission } from '../../types';

export default function StubLink({ onSubmit }: StubLinkProps) {
  const [stubUrl, setStubUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = () => {
    const submission: StubSubmission = {
      stubUrl,
      imageFile
    };
    onSubmit(submission);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card-dark rounded-lg border border-metal-gray">
      <h3 className="text-xl font-bold text-metal-red-bright mb-2">Add Concert Stub</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-secondary">Live Stub URL</label>
        <input
          type="url"
          placeholder="Paste Live Stub URL"
          value={stubUrl}
          onChange={(e) => setStubUrl(e.target.value)}
          className="w-full px-4 py-3 bg-metal-black border border-metal-gray rounded-lg text-primary placeholder-text-muted focus:border-metal-red focus:ring-2 focus:ring-metal-red/20 transition-all"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-secondary">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-3 bg-metal-black border border-metal-gray rounded-lg text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-metal-red file:text-primary file:font-medium hover:file:bg-metal-red-bright transition-all"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stubUrl && !imageFile}
        className="w-full px-6 py-3 bg-metal-red hover:bg-metal-red-bright disabled:bg-metal-gray disabled:cursor-not-allowed text-primary font-semibold rounded-lg transition-all duration-200 hover:transform hover:scale-[1.02] active:scale-[0.98] touch-target"
      >
        Submit Stub
      </button>
    </div>
  );
}
