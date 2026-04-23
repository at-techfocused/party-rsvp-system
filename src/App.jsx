import { useState } from 'react';
import Welcome from './screens/Welcome.jsx';
import RSVPForm from './screens/RSVPForm.jsx';
import Declined from './screens/Declined.jsx';
import ThankYou from './screens/ThankYou.jsx';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [submitted, setSubmitted] = useState(null);

  const goYes = () => setScreen('form');
  const goNo = () => setScreen('declined');
  const goBack = () => setScreen('welcome');

  const onAccepted = (payload) => {
    setSubmitted(payload);
    setScreen('thankyou');
  };

  const onDeclined = () => {
    setScreen('declined-done');
  };

  return (
    <div className="min-h-full flex justify-center">
      <div className="w-full max-w-phone">
        {screen === 'welcome' && <Welcome onYes={goYes} onNo={goNo} />}
        {screen === 'form' && <RSVPForm onBack={goBack} onSuccess={onAccepted} />}
        {screen === 'declined' && (
          <Declined onBack={goBack} onSuccess={onDeclined} done={false} />
        )}
        {screen === 'declined-done' && (
          <Declined onBack={goBack} onSuccess={onDeclined} done={true} />
        )}
        {screen === 'thankyou' && <ThankYou data={submitted} />}
      </div>
    </div>
  );
}
