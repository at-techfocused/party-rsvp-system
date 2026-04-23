import BrickHeader from '../components/BrickHeader.jsx';
import BrickButton from '../components/BrickButton.jsx';
import { PARTY } from '../partyDetails.js';

export default function Welcome({ onYes, onNo }) {
  return (
    <div className="min-h-screen flex flex-col">
      <BrickHeader color="#0055BF" studColor="#003D8A" />

      <main className="flex-1 px-5 pt-6 pb-10 space-y-5">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-lego-blue mb-2">
            You're invited!
          </p>
          <h1
            className="display text-[64px] text-lego-red"
            style={{ WebkitTextStroke: '1px #0055BF' }}
          >
            TEDDY
          </h1>
          <p className="display text-lego-blue text-2xl mt-1">
            is turning {PARTY.age}! <span aria-hidden="true">🎉</span>
          </p>
          <p className="mt-3 text-lg font-semibold text-gray-800">{PARTY.subtitle}</p>
        </header>

        <section className="card space-y-3">
          <Detail emoji="📅" label="When" value={PARTY.dateLabel} />
          <Detail
            emoji="📍"
            label="Where"
            value={
              <>
                <div className="font-semibold">{PARTY.locationName}</div>
                <div className="text-sm text-gray-600">{PARTY.locationAddress}</div>
              </>
            }
          />
          <Detail
            emoji="👋"
            label="Host"
            value={
              <>
                <div>{PARTY.hostName}</div>
                <a
                  href={`tel:${PARTY.hostPhone.replace(/\D/g, '')}`}
                  className="text-sm text-lego-blue underline"
                >
                  {PARTY.hostPhone}
                </a>
              </>
            }
          />
        </section>

        <section className="space-y-3 pt-2">
          <BrickButton color="green" onClick={onYes}>
            Yes, we'll be there! <span aria-hidden="true">🎉</span>
          </BrickButton>
          <BrickButton color="outline" onClick={onNo}>
            Sorry, can't make it
          </BrickButton>
        </section>
      </main>
    </div>
  );
}

function Detail({ emoji, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="text-xl leading-none pt-0.5" aria-hidden="true">
        {emoji}
      </div>
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  );
}
