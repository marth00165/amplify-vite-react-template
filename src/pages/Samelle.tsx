import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiCheck, FiCopy, FiLock, FiMail, FiTerminal } from 'react-icons/fi';
import { sendSamelleHi } from '../api/samelle';

const ACCEPTED_CODE = 'samelle-3f0a';

const packetPayload =
  'eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiYWRtaW4/Iiwibm9uY2UiOiJjMkZ0Wld4c1pRPT0iLCJjbiI6IjNmMGEiLCJraWQiOiJyb3QtNyIsInBheWxvYWQiOiJaSFRMU1NMIn0';

const token = [
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0',
  packetPayload,
  'signature-stripped',
].join('.');

const boot = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.main`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(53, 188, 167, 0.18), transparent 30rem),
    linear-gradient(135deg, #111318 0%, #171a20 48%, #101418 100%);
  color: #f4f7f6;
  display: grid;
  place-items: center;
  padding: 2rem;
`;

const Shell = styled.section`
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(16, 19, 24, 0.86);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  animation: ${boot} 420ms ease-out;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const TerminalPanel = styled.div`
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

const CodeBlock = styled.pre`
  background: #090b0e;
  border: 1px solid rgba(126, 231, 212, 0.26);
  border-radius: 8px;
  color: #d8fff6;
  font-size: 0.86rem;
  line-height: 1.55;
  min-height: 12rem;
  overflow-x: auto;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SidePanel = styled.aside`
  padding: clamp(1.25rem, 3vw, 2rem);
  background: rgba(255, 255, 255, 0.035);
`;

const HintList = styled.ul`
  color: #c9d8d5;
  line-height: 1.65;
  margin: 0 0 1.5rem;
  padding-left: 1.15rem;
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
  transition:
    background 160ms ease,
    transform 160ms ease;

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
  margin: 0;
  min-height: 1.5rem;
`;

const RevealCard = styled.div`
  background: #f7fbfa;
  border-radius: 8px;
  color: #101318;
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
  padding: 1.25rem;
`;

const CardTitle = styled.h2`
  font-size: 1.45rem;
  margin: 0;
`;

export default function Samelle() {
  const [answer, setAnswer] = useState('');
  const [solved, setSolved] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const terminalText = useMemo(
    () => `$ incident-notes --case 7

Recovered token:
${token}

Objective:
1. Inspect the middle segment like a JWT payload.
2. Follow the kid.
3. Pair the decoded payload with cn.

Submit format:
<decoded-payload>-<cn>`,
    []
  );

  const copyPacket = async () => {
    await navigator.clipboard.writeText(token);
  };

  const checkAnswer = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = answer.trim().toLowerCase();

    if (normalized === ACCEPTED_CODE) {
      setSolved(true);
      setMessage('Access granted.');
      return;
    }

    setMessage('Access denied. The packet is honest, but only after decoding.');
  };

  const sayHi = async () => {
    setIsSending(true);
    setMessage('');

    try {
      await sendSamelleHi(answer.trim());
      setSent(true);
      setMessage('Hi sent.');
    } catch (error) {
      console.error('Failed to send Samelle hi:', error);
      setMessage('The puzzle opened, but the email could not be sent yet.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Page>
      <Shell aria-label='Samelle challenge'>
        <TerminalPanel>
          <Header>
            <FiTerminal aria-hidden />
            <Kicker>breach lab</Kicker>
          </Header>
          <Title>Samelle Access Node</Title>
          <Copy>
            A small auth gateway was left with one stripped token and a noisy
            clue trail. Recover the override code and unlock the message.
          </Copy>
          <CodeBlock>{terminalText}</CodeBlock>
        </TerminalPanel>

        <SidePanel>
          <Header>
            <FiLock aria-hidden />
            <Kicker>operator panel</Kicker>
          </Header>

          <HintList>
            <li>JWTs are three dot-separated segments.</li>
            <li>The middle segment is base64url encoded JSON.</li>
            <li>The key id tells you what to reverse.</li>
          </HintList>

          <Form onSubmit={checkAnswer}>
            <Label htmlFor='override-code'>Override code</Label>
            <Input
              autoComplete='off'
              id='override-code'
              onChange={(event) => setAnswer(event.target.value)}
              placeholder='decoded-cn'
              value={answer}
            />
            <Button type='submit'>
              <FiCheck aria-hidden />
              Unlock
            </Button>
            <GhostButton onClick={copyPacket} type='button'>
              <FiCopy aria-hidden />
              Copy token
            </GhostButton>
          </Form>

          {message && (
            <Message $tone={solved ? 'success' : 'error'}>{message}</Message>
          )}

          {solved && (
            <RevealCard role='status'>
              <CardTitle>I miss you, click this button to say hi</CardTitle>
              <Button disabled={isSending || sent} onClick={sayHi} type='button'>
                <FiMail aria-hidden />
                {sent ? 'Hi sent' : isSending ? 'Sending...' : 'Say hi'}
              </Button>
            </RevealCard>
          )}
        </SidePanel>
      </Shell>
    </Page>
  );
}
