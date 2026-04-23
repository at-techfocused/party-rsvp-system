import { useEffect, useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import RSVPForm from './screens/RSVPForm.jsx';
import Declined from './screens/Declined.jsx';
import ThankYou from './screens/ThankYou.jsx';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [submitted, setSubmitted] = useState(null);
  const [existingRsvp, setExistingRsvp] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/rsvp', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.rsvp) setExistingRsvp(data.rsvp);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goYes = () => setScreen('form');
  const goNo = () => setScreen('declined');
  const goBack = () => setScreen('welcome');

  const goEdit = () => {
    if (!existingRsvp) return;
    setScreen(existingRsvp.attending ? 'form' : 'declined');
  };

  const onAccepted = (payload, serverRsvp) => {
    setSubmitted(payload);
    if (serverRsvp) setExistingRsvp(serverRsvp);
    setScreen('thankyou');
  };

  const onDeclined = (serverRsvp) => {
    if (serverRsvp) setExistingRsvp(serverRsvp);
    setScreen('declined-done');
  };

  if (!loaded) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex justify-center">
      <div className="w-full max-w-phone">
        {screen === 'welcome' && (
          <Welcome
            onYes={goYes}
            onNo={goNo}
            existingRsvp={existingRsvp}
            onEdit={goEdit}
          />
        )}
        {screen === 'form' && (
          <RSVPForm
            onBack={goBack}
            onSuccess={onAccepted}
            initialData={existingRsvp}
          />
        )}
        {screen === 'declined' && (
          <Declined
            onBack={goBack}
            onSuccess={onDeclined}
            done={false}
            initialData={existingRsvp}
          />
        )}
        {screen === 'declined-done' && (
          <Declined onBack={goBack} onSuccess={onDeclined} done={true} />
        )}
        {screen === 'thankyou' && <ThankYou data={submitted} />}
      </div>
    </div>
  );
}
