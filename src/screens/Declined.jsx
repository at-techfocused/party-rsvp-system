import { useState } from 'react';
import BrickHeader from '../components/BrickHeader.jsx';
import BrickButton from '../components/BrickButton.jsx';
import Input from '../components/Input.jsx';

export default function Declined({ onBack, onSuccess, done }) {
  const [parentName, setParentName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!parentName.trim()) {
      setError('Please enter your name so Teddy knows who said hi.');
      return;
    }

    const payload = {
      attending: false,
      parentName: parentName.trim(),
      contact: contact.trim() || null,
      childName: null,
      attendees: [],
      notes: null,
      messageToTeddy: message.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <BrickHeader color="#0055BF" studColor="#003D8A" />
        <main className="flex-1 px-5 pt-8 pb-10 space-y-5 text-center">
          <h1 className="display text-3xl text-lego-blue">Thanks for letting us know 💙</h1>
          <p className="text-gray-700">
            Teddy will miss you! We'll pass along your note.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <BrickHeader color="#0055BF" studColor="#003D8A" />

      <form onSubmit={handleSubmit} className="flex-1 px-5 pt-5 pb-10 space-y-4" noValidate>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="tappable text-sm font-semibold text-lego-blue -ml-2 px-2"
          >
            ← Back
          </button>
          <h2 className="display text-xl text-lego-blue">We'll miss you!</h2>
          <span className="w-12" aria-hidden="true" />
        </div>

        <p className="text-gray-700 text-center">
          Drop a quick note so Teddy knows you were thinking of him.
        </p>

        <div className="card space-y-4">
          <Input
            label="Your name"
            value={parentName}
            onChange={setParentName}
            placeholder="Parent or guardian name"
            required
            autoComplete="name"
            name="parentName"
          />
          <Input
            label="Phone or email (optional)"
            value={contact}
            onChange={setContact}
            placeholder="617-555-0142 or you@example.com"
            autoComplete="email"
            inputMode="email"
            name="contact"
          />
          <Input
            label="Message to Teddy (optional)"
            as="textarea"
            value={message}
            onChange={setMessage}
            placeholder="Happy birthday! Catch up soon…"
            name="message"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border-2 border-lego-red bg-red-50 text-lego-red px-3 py-2 text-sm font-semibold"
          >
            {error}
          </div>
        )}

        <BrickButton color="blue" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>Send</>
          )}
        </BrickButton>
      </form>
    </div>
  );
}
