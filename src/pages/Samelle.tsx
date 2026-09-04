import { useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiCoffee,
  FiCopy,
  FiExternalLink,
  FiInstagram,
  FiKey,
  FiLock,
  FiMessageCircle,
  FiRefreshCcw,
  FiSend,
  FiShield,
  FiShoppingBag,
  FiSlash,
  FiTerminal,
  FiX,
} from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import samelleFoodPhoto from '../assets/samelle-food-photo.jpg';
import {
  sendSamelleCommand,
  sendSamelleFoodRequest,
} from '../api/samelle';

type Challenge = {
  id: string;
  caseNumber: string;
  artifact: string;
  answerHashes: string[];
};

const firstPacket = [
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0',
  'eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiYWRtaW4/Iiwibm9uY2UiOiJjMkZ0Wld4c1pRPT0iLCJjbiI6IjNmMGEiLCJraWQiOiJyb3QtNyIsInBheWxvYWQiOiJaSFRMU1NMIn0',
  'signature-stripped',
].join('.');

const challenges: Challenge[] = [
  {
    id: 'token-7',
    caseNumber: 'CASE 07',
    artifact: firstPacket,
    answerHashes: [
      '5bd4a284d1d703b63f1cafcafe06266d936efc4f3614eafac86f6670baa1a251',
    ],
  },
  {
    id: 'access-log',
    caseNumber: 'CASE 11',
    artifact: `10.0.4.11 - GET /health 200
10.0.4.16 - GET /assets/app.js 304
10.0.4.18 - POST /session 201
10.0.4.23 - GET /profile 200
10.0.4.17 - GET /admin?debug=true&code=7f31 403
10.0.4.31 - GET /favicon.ico 404
10.0.4.23 - POST /logout 204`,
    answerHashes: [
      '7eb6bd0813d1ace0efea3a1f866a531ee62953b9cae2e8dae53945476b7d950e',
    ],
  },
  {
    id: 'hex-dump',
    caseNumber: 'CASE 16',
    artifact: '41 43 43 45 53 53 2d 47 52 41 4e 54 45 44',
    answerHashes: [
      '6284513aaab8ab568bba111517296abd194e60c5eefdd4598295c425810895a0',
    ],
  },
  {
    id: 'recovery-blob',
    caseNumber: 'CASE 22',
    artifact:
      '2026-09-03T02:14:08Z Authorization failure: recovery_blob=YnJlYWNoLTQy',
    answerHashes: [
      'a34be3a556ba5aaaa1b0ac229cfa949f4e43b1f101fd16b92b3782e39d958626',
    ],
  },
  {
    id: 'leaked-hash',
    caseNumber: 'CASE 29',
    artifact: `digest: 5f4dcc3b5aa765d61d8327deb882cf99

recovered candidates:
dragon
password
hunter2
admin123`,
    answerHashes: [
      '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    ],
  },
  {
    id: 'headers',
    caseNumber: 'CASE 34',
    artifact: `HTTP/1.1 403 Forbidden
Server: gateway-02
X-Debug-Trace: auth_failed
X-Recovery-Key: NODE-771
X-RateLimit-Remaining: 14
Content-Length: 0`,
    answerHashes: [
      '7db943e67aec299fe2ad460f314a4797a0e5a695a7b6465165deae07e9363a11',
    ],
  },
  {
    id: 'rot-cipher',
    caseNumber: 'CASE 41',
    artifact: 'SECURITY NOTICE: FRGH = EUHDFK',
    answerHashes: [
      'fea6a21b5a0d6404251d8f1f63f78c99bf1b75028331575737c15a6f26ca398b',
      '27920ad58f0e6432507c37002387733f4cbdd0444c4908545c88549771be5974',
    ],
  },
  {
    id: 'dns',
    caseNumber: 'CASE 48',
    artifact: `02:08:13 api.internal A 10.0.0.8
02:08:14 cdn.internal A 10.0.0.9
02:08:15 34323937.telemetry.internal A 10.0.0.21
02:08:16 auth.internal A 10.0.0.4`,
    answerHashes: [
      '1ae2f3fe573bcfcb1768eaf43bcdd5468287b5be04f84907b1e75dbaa5636c24',
    ],
  },
  {
    id: 'authorization',
    caseNumber: 'CASE 53',
    artifact: `{
  "user": "guest",
  "role": "viewer",
  "permissions": ["read"],
  "debug": {
    "effectiveRole": "admin",
    "override": "DELTA-91"
  }
}`,
    answerHashes: [
      'f016ab8650717d5eede95010ad7ffddf45afad41c2332b87b40eed5bd9bd7980',
    ],
  },
  {
    id: 'git-history',
    caseNumber: 'CASE 61',
    artifact: `$ git log --oneline
a81d992 remove temporary credentials
72ac191 add gateway config
19f991a initial commit

$ git show a81d992
diff --git a/.env b/.env
- OVERRIDE_CODE=GHOST-441`,
    answerHashes: [
      '378f6b45686a27319213eb558db71e836061a64ed8d5751c209a1fdb4a1b36ec',
    ],
  },
  {
    id: 'forensics',
    caseNumber: 'CASE 74',
    artifact: `Incident #14

username: svc-backup
failed_logins: 19
source: 10.0.4.17
artifact: 4e4f44452d3737
checksum: irrelevant`,
    answerHashes: [
      '2c1abbd0b655891c84d979196d492cb963f463320044a282f6e917d12f05a058',
    ],
  },
];

type CommandAction = 'hi' | 'starbucks' | 'stop';

const commands = [
  { kind: 'email', action: 'hi', label: 'Click to say hi', icon: FiMessageCircle, accent: '#64f2c8' },
  { kind: 'thoughts', label: 'Solve to unlock my thoughts', icon: FaXTwitter, accent: '#f4f7f6' },
  { kind: 'food', label: 'Click this button for food', icon: FiShoppingBag, accent: '#ffcc66' },
  {
    kind: 'email',
    action: 'starbucks',
    label: 'Click this to get a free Starbucks coffee card',
    icon: FiCoffee,
    accent: '#0fa36b',
  },
  {
    kind: 'link',
    href: 'https://www.instagram.com/elcurry7',
    label: "Click here to learn something you would've never found out about me",
    icon: FiInstagram,
    accent: '#ff7096',
  },
  { kind: 'backflip', label: 'Click to make me do a backflip', icon: FiRefreshCcw, accent: '#75c9ff' },
  { kind: 'email', action: 'stop', label: 'Click to make me stop', icon: FiSlash, accent: '#ff7657' },
] as const;

const VISIT_KEY = 'samelle-challenge-rotation-v2';
const COMPLETED_CHALLENGES_KEY = 'samelle-completed-challenges-v1';
const THOUGHTS_UNLOCKED_KEY = 'samelle-thoughts-unlocked-v1';
const SAME_VISIT_WINDOW_MS = 5000;

function readCompletedChallenges() {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(COMPLETED_CHALLENGES_KEY) ?? '[]'
    );

    return new Set<string>(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set<string>();
  }
}

function rememberCompletedChallenge(challengeId: string) {
  const completed = readCompletedChallenges();
  completed.add(challengeId);
  window.localStorage.setItem(
    COMPLETED_CHALLENGES_KEY,
    JSON.stringify([...completed])
  );
}

function chooseSecretChallenge(currentChallengeId: string) {
  const completed = readCompletedChallenges();
  const currentIndex = challenges.findIndex(
    (candidate) => candidate.id === currentChallengeId
  );
  const rotatedChallenges = challenges.map(
    (_, offset) => challenges[(currentIndex + offset + 1) % challenges.length]
  );

  return (
    rotatedChallenges.find((candidate) => !completed.has(candidate.id)) ??
    rotatedChallenges[0] ??
    challenges[0]
  );
}

function hasUnlockedThoughts() {
  return (
    typeof window !== 'undefined' &&
    window.localStorage.getItem(THOUGHTS_UNLOCKED_KEY) === 'true'
  );
}

function getTodayForInput() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function chooseChallengeIndex() {
  if (typeof window === 'undefined') return 0;

  try {
    const now = Date.now();
    const stored = window.localStorage.getItem(VISIT_KEY);

    if (!stored) {
      window.localStorage.setItem(
        VISIT_KEY,
        JSON.stringify({ index: 0, visitedAt: now })
      );
      return 0;
    }

    const previous = JSON.parse(stored) as {
      index?: number;
      visitedAt?: number;
    };
    const previousIndex = Number.isInteger(previous.index) ? previous.index! : 0;

    if (
      typeof previous.visitedAt === 'number' &&
      now - previous.visitedAt < SAME_VISIT_WINDOW_MS
    ) {
      return previousIndex % challenges.length;
    }

    const nextIndex = (previousIndex + 1) % challenges.length;
    window.localStorage.setItem(
      VISIT_KEY,
      JSON.stringify({ index: nextIndex, visitedAt: now })
    );
    return nextIndex;
  } catch {
    return 0;
  }
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function hashAnswer(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

const boot = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const commandReveal = keyframes`
  0% {
    clip-path: circle(0% at 50% 50%);
    filter: brightness(2.4);
  }
  65% { filter: brightness(1.25); }
  100% {
    clip-path: circle(150% at 50% 50%);
    filter: brightness(1);
  }
`;

const scan = keyframes`
  from { transform: translateY(-120%); }
  to { transform: translateY(120vh); }
`;

const backflip = keyframes`
  0% { transform: rotateX(0deg) scale(1); }
  45% { transform: rotateX(190deg) scale(0.92); }
  100% { transform: rotateX(360deg) scale(1); }
`;

const Page = styled.main`
  min-height: 100svh;
  background:
    radial-gradient(circle at top left, rgba(53, 188, 167, 0.18), transparent 30rem),
    linear-gradient(135deg, #111318 0%, #171a20 48%, #101418 100%);
  color: #f4f7f6;
  display: grid;
  place-items: center;
  padding: 2rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Shell = styled.section`
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(16, 19, 24, 0.9);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  animation: ${boot} 420ms ease-out;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const TerminalPanel = styled.div`
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 2rem);
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 800px) {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #7ee7d4;
  margin-bottom: 1.25rem;
`;

const Kicker = styled.span`
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1;
  margin: 0 0 1rem;
`;

const Copy = styled.p`
  color: #c8d2d0;
  line-height: 1.7;
  margin: 0 0 1.5rem;
`;

const Brief = styled.div`
  border-left: 3px solid #ffcc66;
  color: #ecf2f0;
  font-size: 0.93rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 0.15rem 0 0.15rem 0.85rem;

  strong {
    color: #ffcc66;
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    margin-bottom: 0.25rem;
  }
`;

const CodeBlock = styled.pre`
  background: #090b0e;
  border: 1px solid rgba(126, 231, 212, 0.26);
  border-radius: 8px;
  color: #d8fff6;
  font-size: 0.84rem;
  line-height: 1.55;
  min-height: 13rem;
  max-height: 26rem;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SidePanel = styled.aside`
  padding: clamp(1.25rem, 3vw, 2rem);
  background: rgba(255, 255, 255, 0.035);
`;

const Form = styled.form`
  display: grid;
  gap: 0.8rem;
`;

const Label = styled.label`
  color: #f7fbfa;
  font-weight: 700;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  color: #ffffff;
  font: inherit;
  padding: 0.9rem 1rem;

  &:focus {
    border-color: #7ee7d4;
    outline: 2px solid rgba(126, 231, 212, 0.18);
  }
`;

const Button = styled.button`
  align-items: center;
  background: #7ee7d4;
  border: 0;
  border-radius: 8px;
  color: #07100e;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 800;
  gap: 0.5rem;
  justify-content: center;
  min-height: 2.9rem;
  padding: 0.8rem 1rem;
  transition: background 160ms ease, transform 160ms ease;

  &:hover:not(:disabled) {
    background: #a3f5e8;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const GhostButton = styled(Button)`
  background: rgba(255, 255, 255, 0.09);
  color: #effaf8;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
  }
`;

const Message = styled.p<{ $tone: 'error' | 'success' }>`
  color: ${({ $tone }) => ($tone === 'error' ? '#ffb3bd' : '#95f0ce')};
  margin: 1rem 0 0;
  min-height: 1.5rem;
`;

const CommandScreen = styled.main`
  min-height: 100svh;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  color: #f8fbfa;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 4vw, 3rem);
  perspective: 1200px;
  background-color: #080a0d;
  background-image:
    linear-gradient(rgba(100, 242, 200, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 242, 200, 0.055) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: ${commandReveal} 850ms cubic-bezier(0.7, 0, 0.2, 1) both;

  &::after {
    content: '';
    position: fixed;
    inset: 0;
    height: 20vh;
    pointer-events: none;
    background: linear-gradient(transparent, rgba(100, 242, 200, 0.09), transparent);
    animation: ${scan} 3.6s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &::after { display: none; }
  }
`;

const CommandFrame = styled.section<{ $isFlipping: boolean }>`
  width: min(1040px, 100%);
  border: 1px solid rgba(100, 242, 200, 0.38);
  border-radius: 8px;
  background: rgba(8, 11, 14, 0.94);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04), 0 30px 100px rgba(0, 0, 0, 0.6);
  padding: clamp(1.25rem, 4vw, 3rem);
  position: relative;
  transform-style: preserve-3d;
  z-index: 1;

  ${({ $isFlipping }) =>
    $isFlipping &&
    css`
      animation: ${backflip} 680ms cubic-bezier(0.65, 0, 0.35, 1);
      pointer-events: none;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const CommandHeader = styled.header`
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 2rem;

  @media (max-width: 650px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const GodMode = styled.div`
  align-items: center;
  color: #64f2c8;
  display: flex;
  font-size: 0.76rem;
  font-weight: 800;
  gap: 0.5rem;
  letter-spacing: 0.08em;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
`;

const CommandTitle = styled.h1`
  font-size: clamp(2rem, 6vw, 4.7rem);
  line-height: 0.98;
  margin: 0 0 0.8rem;
  max-width: 760px;
`;

const CommandCopy = styled.p`
  color: #b8c6c2;
  line-height: 1.6;
  margin: 0;
`;

const LockButton = styled(GhostButton)`
  flex: 0 0 auto;
`;

const CommandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const CommandButton = styled.button<{ $accent: string }>`
  align-items: center;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-left: 4px solid ${({ $accent }) => $accent};
  border-radius: 6px;
  color: #f8fbfa;
  cursor: pointer;
  display: grid;
  font: inherit;
  font-weight: 750;
  gap: 0.9rem;
  grid-template-columns: 2.4rem minmax(0, 1fr) 1.2rem;
  min-height: 5.5rem;
  padding: 1rem;
  text-align: left;
  text-decoration: none;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;

  > svg:first-child { color: ${({ $accent }) => $accent}; }
  > svg:last-child { color: #71817d; }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.085);
    border-color: ${({ $accent }) => $accent};
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.52;
  }
`;

const ModalBackdrop = styled.div`
  align-items: center;
  background: rgba(3, 5, 7, 0.86);
  display: flex;
  inset: 0;
  justify-content: center;
  overflow-y: auto;
  padding: 1rem;
  position: fixed;
  z-index: 20;
`;

const ModalPanel = styled.section`
  background: #0d1115;
  border: 1px solid rgba(100, 242, 200, 0.38);
  border-radius: 8px;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.72);
  color: #f8fbfa;
  margin: auto;
  max-width: 760px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const ModalHeader = styled.header`
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.35rem 1.35rem 0;
`;

const ModalKicker = styled.div`
  align-items: center;
  color: #64f2c8;
  display: flex;
  font-size: 0.74rem;
  font-weight: 800;
  gap: 0.45rem;
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
  text-transform: uppercase;
`;

const ModalTitle = styled.h2`
  font-size: clamp(1.55rem, 4vw, 2.4rem);
  line-height: 1.05;
  margin: 0;
`;

const ModalClose = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  color: #f8fbfa;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  height: 2.5rem;
  justify-content: center;
  width: 2.5rem;

  svg {
    flex: 0 0 20px;
  }

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.14);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SecretBody = styled.div`
  padding: 1.35rem;
`;

const SecretCopy = styled.p`
  color: #b8c6c2;
  line-height: 1.6;
  margin: 0 0 1rem;
`;

const SecretArtifact = styled.pre`
  background: #07090b;
  border: 1px solid rgba(100, 242, 200, 0.22);
  border-radius: 6px;
  color: #d8fff6;
  font-size: 0.82rem;
  line-height: 1.5;
  margin: 0 0 1rem;
  max-height: 16rem;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ModalForm = styled.form`
  display: grid;
  gap: 0.9rem;
`;

const Field = styled.div`
  display: grid;
  gap: 0.45rem;
`;

const FieldLabel = styled.label`
  align-items: center;
  color: #edf5f2;
  display: flex;
  font-size: 0.9rem;
  font-weight: 750;
  gap: 0.45rem;
`;

const ModalInput = styled(Input)`
  color-scheme: dark;
  min-width: 0;
  width: 100%;
`;

const FoodBody = styled.div`
  display: grid;
  gap: 1.35rem;
  grid-template-columns: minmax(180px, 0.72fr) minmax(0, 1.28fr);
  padding: 1.35rem;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

const FoodPhoto = styled.img`
  aspect-ratio: 3 / 4;
  border-radius: 6px;
  height: 100%;
  max-height: 27rem;
  object-fit: cover;
  object-position: center;
  width: 100%;

  @media (max-width: 620px) {
    aspect-ratio: 16 / 10;
    max-height: 14rem;
    object-position: center 58%;
  }
`;

const FoodCopy = styled.p`
  color: #b8c6c2;
  line-height: 1.55;
  margin: 0 0 1rem;
`;

const DateTimeFields = styled.div`
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 440px) {
    grid-template-columns: 1fr;
  }
`;

const ModalStatus = styled.p<{ $tone?: 'error' | 'success' }>`
  color: ${({ $tone }) =>
    $tone === 'error' ? '#ffb3bd' : $tone === 'success' ? '#95f0ce' : '#b8c6c2'};
  margin: 0;
  min-height: 1.4rem;
`;

const Transmission = styled.p`
  color: #95f0ce;
  margin: 1.25rem 0 0;
  min-height: 1.5rem;
`;

export default function Samelle() {
  const [challengeIndex] = useState(chooseChallengeIndex);
  const [answer, setAnswer] = useState('');
  const [solvedCode, setSolvedCode] = useState('');
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [sendingAction, setSendingAction] = useState<CommandAction | null>(null);
  const [sentActions, setSentActions] = useState<Set<CommandAction>>(new Set());
  const [transmission, setTransmission] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [thoughtsUnlocked, setThoughtsUnlocked] = useState(hasUnlockedThoughts);
  const [secretPuzzleOpen, setSecretPuzzleOpen] = useState(false);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [secretChecking, setSecretChecking] = useState(false);
  const [foodFormOpen, setFoodFormOpen] = useState(false);
  const [foodChoice, setFoodChoice] = useState('');
  const [foodDate, setFoodDate] = useState('');
  const [foodTime, setFoodTime] = useState('');
  const [foodSending, setFoodSending] = useState(false);
  const [foodSent, setFoodSent] = useState(false);
  const [foodStatus, setFoodStatus] = useState('');
  const challenge = challenges[challengeIndex];
  const secretChallenge = useMemo(
    () => chooseSecretChallenge(challenge.id),
    [challenge.id]
  );

  const terminalText = useMemo(
    () => `$ access-node --challenge ${challenge.caseNumber}\n\nEncrypted artifact:\n${challenge.artifact}\n\nSTATUS: LOCKED`,
    [challenge]
  );

  useEffect(() => {
    if (!secretPuzzleOpen && !foodFormOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || foodSending) return;

      setSecretPuzzleOpen(false);
      setFoodFormOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [foodFormOpen, foodSending, secretPuzzleOpen]);

  const copyArtifact = async () => {
    await navigator.clipboard.writeText(challenge.artifact);
    setMessage('Artifact copied.');
  };

  const checkAnswer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsChecking(true);
    const normalized = normalizeAnswer(answer);

    try {
      const submittedHash = await hashAnswer(normalized);

      if (challenge.answerHashes.includes(submittedHash)) {
        rememberCompletedChallenge(challenge.id);
        setSolvedCode(normalized);
        setMessage('');
        setSolved(true);
        return;
      }

      setMessage('Access denied. Try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const sendCommand = async (action: CommandAction) => {
    setSendingAction(action);
    setTransmission('Transmitting command...');

    try {
      await sendSamelleCommand(solvedCode, action);
      setSentActions((current) => new Set(current).add(action));
      setTransmission('Command received. Rohit has been notified.');
    } catch (error) {
      console.error('Failed to send Samelle command:', error);
      setTransmission('Transmission failed. The command channel is unavailable.');
    } finally {
      setSendingAction(null);
    }
  };

  const lockScreen = () => {
    setSolved(false);
    setSolvedCode('');
    setAnswer('');
    setMessage('');
    setTransmission('');
    setSentActions(new Set());
    setSecretPuzzleOpen(false);
    setFoodFormOpen(false);
    setFoodSent(false);
    setFoodStatus('');
  };

  const flipPanel = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    window.setTimeout(() => setIsFlipping(false), 680);
  };

  const checkSecretAnswer = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSecretChecking(true);
    const normalized = normalizeAnswer(secretAnswer);

    try {
      const submittedHash = await hashAnswer(normalized);

      if (secretChallenge.answerHashes.includes(submittedHash)) {
        rememberCompletedChallenge(secretChallenge.id);
        window.localStorage.setItem(THOUGHTS_UNLOCKED_KEY, 'true');
        setThoughtsUnlocked(true);
        setSecretPuzzleOpen(false);
        setSecretAnswer('');
        setSecretMessage('');
        setTransmission('Thought channel unlocked.');
        return;
      }

      setSecretMessage('Access denied. Try again.');
    } finally {
      setSecretChecking(false);
    }
  };

  const submitFoodRequest = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFoodSending(true);
    setFoodStatus('Sending your order to Rohit...');

    try {
      await sendSamelleFoodRequest(solvedCode, {
        food: foodChoice,
        date: foodDate,
        time: foodTime,
      });
      setFoodSent(true);
      setFoodStatus('Food request sent. Rohit has the details.');
      setTransmission('Food request received. Rohit has been notified.');
    } catch (error) {
      console.error('Failed to send Samelle food request:', error);
      setFoodStatus('Could not send the request. Try again in a moment.');
    } finally {
      setFoodSending(false);
    }
  };

  if (solved) {
    return (
      <CommandScreen aria-label='Rohit command panel'>
        <CommandFrame $isFlipping={isFlipping}>
          <CommandHeader>
            <div>
              <GodMode>
                <FiShield aria-hidden /> God mode unlocked
              </GodMode>
              <CommandTitle>This is your command: Rohit Panel</CommandTitle>
              <CommandCopy>Click a button to issue a command.</CommandCopy>
            </div>
            <LockButton onClick={lockScreen} type='button'>
              <FiLock aria-hidden />
              Lock screen
            </LockButton>
          </CommandHeader>

          <CommandGrid>
            {commands.map((command) => {
              const Icon = command.icon;

              if (command.kind === 'link') {
                return (
                  <CommandButton
                    as='a'
                    $accent={command.accent}
                    href={command.href}
                    key={command.href}
                    rel='noreferrer'
                    target='_blank'
                  >
                    <Icon aria-hidden size={22} />
                    <span>{command.label}</span>
                    <FiExternalLink aria-hidden />
                  </CommandButton>
                );
              }

              if (command.kind === 'thoughts') {
                if (thoughtsUnlocked) {
                  return (
                    <CommandButton
                      as='a'
                      $accent={command.accent}
                      href='https://x.com/BrohitTv'
                      key={command.kind}
                      rel='noreferrer'
                      target='_blank'
                    >
                      <Icon aria-hidden size={22} />
                      <span>Open my thoughts</span>
                      <FiExternalLink aria-hidden />
                    </CommandButton>
                  );
                }

                return (
                  <CommandButton
                    $accent={command.accent}
                    key={command.kind}
                    onClick={() => setSecretPuzzleOpen(true)}
                    type='button'
                  >
                    <Icon aria-hidden size={22} />
                    <span>{command.label}</span>
                    <FiLock aria-hidden />
                  </CommandButton>
                );
              }

              if (command.kind === 'food') {
                return (
                  <CommandButton
                    $accent={command.accent}
                    disabled={foodSending || foodSent}
                    key={command.kind}
                    onClick={() => setFoodFormOpen(true)}
                    type='button'
                  >
                    <Icon aria-hidden size={22} />
                    <span>{foodSent ? 'Food request sent' : command.label}</span>
                    <FiSend aria-hidden />
                  </CommandButton>
                );
              }

              if (command.kind === 'backflip') {
                return (
                  <CommandButton
                    $accent={command.accent}
                    disabled={isFlipping}
                    key={command.kind}
                    onClick={flipPanel}
                    type='button'
                  >
                    <Icon aria-hidden size={22} />
                    <span>{command.label}</span>
                    <FiRefreshCcw aria-hidden />
                  </CommandButton>
                );
              }

              const wasSent = sentActions.has(command.action);

              return (
                <CommandButton
                  $accent={command.accent}
                  disabled={sendingAction !== null || wasSent}
                  key={command.action}
                  onClick={() => sendCommand(command.action)}
                  type='button'
                >
                  <Icon aria-hidden size={22} />
                  <span>{wasSent ? 'Command sent' : command.label}</span>
                  <FiSend aria-hidden />
                </CommandButton>
              );
            })}
          </CommandGrid>

          <Transmission aria-live='polite'>{transmission}</Transmission>
        </CommandFrame>

        {secretPuzzleOpen && (
          <ModalBackdrop
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !secretChecking) {
                setSecretPuzzleOpen(false);
              }
            }}
          >
            <ModalPanel
              aria-labelledby='thought-vault-title'
              aria-modal='true'
              role='dialog'
            >
              <ModalHeader>
                <div>
                  <ModalKicker>
                    <FiKey aria-hidden /> secret challenge //{' '}
                    {secretChallenge.caseNumber}
                  </ModalKicker>
                  <ModalTitle id='thought-vault-title'>Thought vault</ModalTitle>
                </div>
                <ModalClose
                  aria-label='Close thought vault'
                  disabled={secretChecking}
                  onClick={() => setSecretPuzzleOpen(false)}
                  title='Close'
                  type='button'
                >
                  <FiX aria-hidden size={20} />
                </ModalClose>
              </ModalHeader>
              <SecretBody>
                <SecretCopy>
                  One more system stands between you and Rohit&apos;s unfiltered
                  thoughts.
                </SecretCopy>
                <SecretArtifact>{secretChallenge.artifact}</SecretArtifact>
                <ModalForm onSubmit={checkSecretAnswer}>
                  <Field>
                    <FieldLabel htmlFor='secret-override-code'>
                      <FiKey aria-hidden /> Override code
                    </FieldLabel>
                    <ModalInput
                      autoComplete='off'
                      autoFocus
                      id='secret-override-code'
                      onChange={(event) => setSecretAnswer(event.target.value)}
                      placeholder='Enter access code'
                      value={secretAnswer}
                    />
                  </Field>
                  <Button
                    disabled={secretChecking || !secretAnswer.trim()}
                    type='submit'
                  >
                    <FiLock aria-hidden />
                    {secretChecking ? 'Checking...' : 'Unlock thoughts'}
                  </Button>
                  <ModalStatus
                    $tone={secretMessage ? 'error' : undefined}
                    aria-live='polite'
                  >
                    {secretMessage}
                  </ModalStatus>
                </ModalForm>
              </SecretBody>
            </ModalPanel>
          </ModalBackdrop>
        )}

        {foodFormOpen && (
          <ModalBackdrop
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !foodSending) {
                setFoodFormOpen(false);
              }
            }}
          >
            <ModalPanel
              aria-labelledby='food-request-title'
              aria-modal='true'
              role='dialog'
            >
              <ModalHeader>
                <div>
                  <ModalKicker>
                    <FiShoppingBag aria-hidden /> food request
                  </ModalKicker>
                  <ModalTitle id='food-request-title'>What are we eating?</ModalTitle>
                </div>
                <ModalClose
                  aria-label='Close food request'
                  disabled={foodSending}
                  onClick={() => setFoodFormOpen(false)}
                  title='Close'
                  type='button'
                >
                  <FiX aria-hidden size={20} />
                </ModalClose>
              </ModalHeader>
              <FoodBody>
                <FoodPhoto
                  alt='Samelle taking a mirror selfie'
                  src={samelleFoodPhoto}
                />
                <div>
                  <FoodCopy>
                    Pick what sounds good and when you want it. Rohit gets the
                    coordinates.
                  </FoodCopy>
                  <ModalForm onSubmit={submitFoodRequest}>
                    <Field>
                      <FieldLabel htmlFor='food-choice'>
                        <FiShoppingBag aria-hidden /> What kind of food do you
                        want?
                      </FieldLabel>
                      <ModalInput
                        autoComplete='off'
                        autoFocus
                        id='food-choice'
                        maxLength={160}
                        onChange={(event) => setFoodChoice(event.target.value)}
                        placeholder='Sushi, tacos, pasta...'
                        required
                        value={foodChoice}
                      />
                    </Field>
                    <DateTimeFields>
                      <Field>
                        <FieldLabel htmlFor='food-date'>
                          <FiCalendar aria-hidden /> Pick a date
                        </FieldLabel>
                        <ModalInput
                          id='food-date'
                          min={getTodayForInput()}
                          onChange={(event) => setFoodDate(event.target.value)}
                          required
                          type='date'
                          value={foodDate}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor='food-time'>
                          <FiClock aria-hidden /> Pick a time
                        </FieldLabel>
                        <ModalInput
                          id='food-time'
                          onChange={(event) => setFoodTime(event.target.value)}
                          required
                          type='time'
                          value={foodTime}
                        />
                      </Field>
                    </DateTimeFields>
                    <Button
                      disabled={foodSending || foodSent}
                      type='submit'
                    >
                      <FiSend aria-hidden />
                      {foodSending
                        ? 'Sending...'
                        : foodSent
                          ? 'Request sent'
                          : 'Send food request'}
                    </Button>
                    <ModalStatus
                      $tone={
                        foodStatus.includes('Could not')
                          ? 'error'
                          : foodSent
                            ? 'success'
                            : undefined
                      }
                      aria-live='polite'
                    >
                      {foodStatus}
                    </ModalStatus>
                  </ModalForm>
                </div>
              </FoodBody>
            </ModalPanel>
          </ModalBackdrop>
        )}
      </CommandScreen>
    );
  }

  return (
    <Page>
      <Shell aria-label='Samelle challenge'>
        <TerminalPanel>
          <Header>
            <FiTerminal aria-hidden />
            <Kicker>breach lab // {challenge.caseNumber}</Kicker>
          </Header>
          <Title>Samelle Access Node</Title>
          <Copy>Solve the challenge to unlock a secret message.</Copy>
          <Brief>
            <strong>BRIEF</strong>
            A sealed command system is buried inside this artifact. Break the
            lock to unlock the power of God Mode.
          </Brief>
          <CodeBlock>{terminalText}</CodeBlock>
        </TerminalPanel>

        <SidePanel>
          <Header>
            <FiLock aria-hidden />
            <Kicker>operator panel</Kicker>
          </Header>

          <Form onSubmit={checkAnswer}>
            <Label htmlFor='override-code'>Override code</Label>
            <Input
              autoComplete='off'
              id='override-code'
              onChange={(event) => setAnswer(event.target.value)}
              placeholder='Enter access code'
              value={answer}
            />
            <Button disabled={isChecking || !answer.trim()} type='submit'>
              <FiCheck aria-hidden />
              {isChecking ? 'Checking...' : 'Unlock'}
            </Button>
            <GhostButton onClick={copyArtifact} type='button'>
              <FiCopy aria-hidden />
              Copy artifact
            </GhostButton>
          </Form>

          {message && (
            <Message $tone={message.includes('denied') ? 'error' : 'success'}>
              {message}
            </Message>
          )}
        </SidePanel>
      </Shell>
    </Page>
  );
}
