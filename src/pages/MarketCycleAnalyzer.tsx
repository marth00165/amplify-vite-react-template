import { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import { Button, Card } from '../components/themed-components';

// Types based on the cycle JSON structure
interface MarketFilter {
  passed?: boolean;
  checks?: {
    volume_ok?: boolean;
    liquidity_ok?: boolean;
    price_ok?: boolean;
  };
  reasons?: string[];
}

interface Signal {
  market_id?: string;
  platform?: string;
  action?: string;
  side?: string;
  fair_value?: number;
  market_price?: number;
  estimated_probability?: number;
  edge?: number;
  confidence?: number;
  kelly_fraction?: number;
  position_size?: number;
  expected_value?: number;
  reasoning?: string;
}

interface Opportunity {
  side?: string;
  edge?: number;
  estimated_probability?: number;
}

interface Market {
  market_id: string;
  platform: string;
  title: string;
  description: string;
  category: string;
  end_date: string;
  event_ticker?: string;
  yes_option?: string;
  no_option?: string;
  volume_tier?: string;
  prices: {
    yes: number;
    no: number;
  };
  stats: {
    volume: number;
    liquidity: number;
  };
  filters?: MarketFilter;
  analysis: unknown | null;
  opportunity?: Opportunity | null;
  signal?: Signal | null;
  execution: unknown | null;
}

interface TierSummary {
  high?: number;
  medium?: number;
  low?: number;
  skip?: number;
}

interface CycleConfig {
  analysis_provider: string;
  dry_run: boolean;
  api: {
    batch_size: number;
    api_cost_limit_per_cycle: number;
  };
  platforms: {
    polymarket: { enabled: boolean; max_markets: number };
    kalshi: { enabled: boolean; max_markets: number };
  };
  filters: {
    min_volume: number;
    min_liquidity: number;
    price_bounds: { min: number; max: number };
  };
  strategy: {
    min_edge: number;
    min_confidence: number;
  };
  risk: {
    max_kelly_fraction: number;
    max_positions: number;
    max_position_size: number;
  };
}

interface CycleCounts {
  scanned: number;
  passed_filters: number;
  analyzed: number;
  estimates: number;
  opportunities: number;
  signals: number;
  executed: number;
}

interface ApiCost {
  total_cost: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_cost_per_request: number;
}

interface CycleData {
  cycle?: number;
  started_at?: string;
  finished_at?: string;
  config?: Partial<CycleConfig>;
  counts?: Partial<CycleCounts>;
  api_cost?: Partial<ApiCost>;
  markets?: Market[];
  signals?: Signal[];
  errors?: unknown[];
  events?: unknown[];
  tier_summary?: TierSummary;
}

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #7c9eb2;
  font-size: 1.1rem;
`;

const InputSection = styled(Card)`
  max-width: 800px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.95);
`;

const InputLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #52528c;
  }

  &::placeholder {
    color: #999;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  background: #7c9eb2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #52528c;
  }
`;

const ClearButton = styled(Button)`
  background: #dc3545;

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
`;

// Summary Section
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
`;

const SummaryTitle = styled.h3`
  color: #52528c;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 2px solid #7c9eb2;
  padding-bottom: 0.5rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #333;
`;

// Markets Table
const TableSection = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
`;

const TableTitle = styled.h2`
  color: #52528c;
  margin-bottom: 1rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  background: #52528c;
  color: white;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  position: sticky;
  top: 0;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }

  &:nth-child(even) {
    background: #fafafa;
  }

  &:nth-child(even):hover {
    background: #f0f0f0;
  }
`;

const MarketTitle = styled.div`
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const Badge = styled.span<{
  $variant: 'success' | 'error' | 'warning' | 'info';
}>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${({ $variant }) => {
    switch ($variant) {
      case 'success':
        return 'background: #d4edda; color: #155724;';
      case 'error':
        return 'background: #f8d7da; color: #721c24;';
      case 'warning':
        return 'background: #fff3cd; color: #856404;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460;';
    }
  }}
`;

const CheckIcon = styled.span<{ $passed: boolean }>`
  color: ${({ $passed }) => ($passed ? '#28a745' : '#dc3545')};
  font-weight: bold;
`;

const ReasonsList = styled.ul`
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: #dc3545;
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PriceRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PriceLabel = styled.span`
  font-size: 0.7rem;
  color: #666;
  width: 25px;
`;

const PriceValue = styled.span`
  font-weight: 600;
`;

const FilterToggle = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #333;
`;

const ReportSection = styled.div`
  /* This wrapper is used for screenshot capture */
`;

const DownloadButton = styled(Button)`
  background: #28a745;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ReportTitle = styled.h2`
  color: white;
  margin: 0;
`;

const SignalsSection = styled(Card)`
  background: rgba(255, 255, 255, 0.95);
  margin-bottom: 2rem;
`;

const SignalCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #52528c;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SignalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SignalTitle = styled.h4`
  margin: 0;
  color: #333;
  font-size: 0.95rem;
`;

const SignalStats = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const SignalStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  min-width: 80px;
`;

const SignalStatLabel = styled.span`
  font-size: 0.7rem;
  color: #666;
  text-transform: uppercase;
`;

const SignalStatValue = styled.span<{ $highlight?: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ $highlight }) => ($highlight ? '#28a745' : '#333')};
`;

const SignalReasoning = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  background: white;
  padding: 0.75rem;
  border-radius: 4px;
`;

const TierBadge = styled.span<{ $tier: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${({ $tier }) => {
    switch ($tier) {
      case 'high':
        return 'background: #d4edda; color: #155724;';
      case 'medium':
        return 'background: #fff3cd; color: #856404;';
      case 'low':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

export default function MarketCycleAnalyzer() {
  const [jsonInput, setJsonInput] = useState('');
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPassed, setShowOnlyPassed] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadScreenshot = useCallback(async () => {
    if (!reportRef.current) return;

    setIsCapturing(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `market-cycle-report-${
        cycleData?.cycle ?? 'unknown'
      }-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      setError('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [cycleData?.cycle]);

  const parseJson = useCallback(() => {
    setError(null);
    if (!jsonInput.trim()) {
      setError('Please enter some JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      setCycleData(parsed);
    } catch (e) {
      setError(
        `Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`,
      );
    }
  }, [jsonInput]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
        setError(null);

        try {
          const parsed = JSON.parse(content);
          setCycleData(parsed);
        } catch (err) {
          setError(
            `Invalid JSON file: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`,
          );
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const clearData = useCallback(() => {
    setJsonInput('');
    setCycleData(null);
    setError(null);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const filteredMarkets =
    cycleData?.markets?.filter(
      (market) => !showOnlyPassed || market.filters?.passed,
    ) ?? [];

  return (
    <PageContainer>
      <Header>
        <Title>📊 Market Cycle Analyzer</Title>
        <Subtitle>
          Upload or paste your cycle JSON to visualize market data
        </Subtitle>
      </Header>

      <InputSection>
        <InputLabel>Paste JSON or upload a file:</InputLabel>
        <TextArea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"cycle": 1, "markets": [...], ...}'
        />
        <ButtonRow>
          <Button onClick={parseJson}>Parse JSON</Button>
          <FileInput
            type='file'
            id='file-upload'
            accept='.json'
            onChange={handleFileUpload}
          />
          <FileLabel htmlFor='file-upload'>📁 Upload JSON File</FileLabel>
          {(jsonInput || cycleData) && (
            <ClearButton onClick={clearData}>Clear</ClearButton>
          )}
        </ButtonRow>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputSection>

      {cycleData && (
        <>
          <ReportHeader>
            <ReportTitle>
              📈 Cycle {cycleData.cycle ?? 'N/A'} Report
            </ReportTitle>
            <DownloadButton onClick={downloadScreenshot} disabled={isCapturing}>
              {isCapturing ? '📸 Capturing...' : '📸 Download Screenshot'}
            </DownloadButton>
          </ReportHeader>

          <ReportSection ref={reportRef}>
            {/* Summary Cards */}
            <SummaryGrid>
              <SummaryCard>
                <SummaryTitle>🔄 Cycle Info</SummaryTitle>
                <StatRow>
                  <StatLabel>Cycle Number</StatLabel>
                  <StatValue>{cycleData.cycle ?? 'N/A'}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Started</StatLabel>
                  <StatValue>
                    {cycleData.started_at
                      ? formatDate(cycleData.started_at)
                      : 'N/A'}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Finished</StatLabel>
                  <StatValue>
                    {cycleData.finished_at
                      ? formatDate(cycleData.finished_at)
                      : 'N/A'}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Provider</StatLabel>
                  <StatValue>
                    {cycleData.config?.analysis_provider ?? 'N/A'}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Dry Run</StatLabel>
                  <StatValue>
                    {cycleData.config?.dry_run ? 'Yes' : 'No'}
                  </StatValue>
                </StatRow>
              </SummaryCard>

              <SummaryCard>
                <SummaryTitle>📈 Counts</SummaryTitle>
                <StatRow>
                  <StatLabel>Scanned</StatLabel>
                  <StatValue>{cycleData.counts?.scanned ?? 0}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Passed Filters</StatLabel>
                  <StatValue>{cycleData.counts?.passed_filters ?? 0}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Analyzed</StatLabel>
                  <StatValue>{cycleData.counts?.analyzed ?? 0}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Opportunities</StatLabel>
                  <StatValue>{cycleData.counts?.opportunities ?? 0}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Signals</StatLabel>
                  <StatValue>{cycleData.counts?.signals ?? 0}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Executed</StatLabel>
                  <StatValue>{cycleData.counts?.executed ?? 0}</StatValue>
                </StatRow>
              </SummaryCard>

              <SummaryCard>
                <SummaryTitle>💰 API Cost</SummaryTitle>
                <StatRow>
                  <StatLabel>Total Cost</StatLabel>
                  <StatValue>
                    ${(cycleData.api_cost?.total_cost ?? 0).toFixed(4)}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Total Requests</StatLabel>
                  <StatValue>
                    {cycleData.api_cost?.total_requests ?? 0}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Input Tokens</StatLabel>
                  <StatValue>
                    {(
                      cycleData.api_cost?.total_input_tokens ?? 0
                    ).toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Output Tokens</StatLabel>
                  <StatValue>
                    {(
                      cycleData.api_cost?.total_output_tokens ?? 0
                    ).toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Avg Cost/Request</StatLabel>
                  <StatValue>
                    $
                    {(cycleData.api_cost?.avg_cost_per_request ?? 0).toFixed(4)}
                  </StatValue>
                </StatRow>
              </SummaryCard>

              <SummaryCard>
                <SummaryTitle>⚙️ Configuration</SummaryTitle>
                <StatRow>
                  <StatLabel>Min Volume</StatLabel>
                  <StatValue>
                    $
                    {(
                      cycleData.config?.filters?.min_volume ?? 0
                    ).toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Min Liquidity</StatLabel>
                  <StatValue>
                    $
                    {(
                      cycleData.config?.filters?.min_liquidity ?? 0
                    ).toLocaleString()}
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Min Edge</StatLabel>
                  <StatValue>
                    {(
                      (cycleData.config?.strategy?.min_edge ?? 0) * 100
                    ).toFixed(0)}
                    %
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Min Confidence</StatLabel>
                  <StatValue>
                    {(
                      (cycleData.config?.strategy?.min_confidence ?? 0) * 100
                    ).toFixed(0)}
                    %
                  </StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Max Position Size</StatLabel>
                  <StatValue>
                    $
                    {(
                      cycleData.config?.risk?.max_position_size ?? 0
                    ).toLocaleString()}
                  </StatValue>
                </StatRow>
              </SummaryCard>

              {cycleData.tier_summary && (
                <SummaryCard>
                  <SummaryTitle>📊 Volume Tiers</SummaryTitle>
                  <StatRow>
                    <StatLabel>High Volume</StatLabel>
                    <StatValue>{cycleData.tier_summary.high ?? 0}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Medium Volume</StatLabel>
                    <StatValue>{cycleData.tier_summary.medium ?? 0}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Low Volume</StatLabel>
                    <StatValue>{cycleData.tier_summary.low ?? 0}</StatValue>
                  </StatRow>
                  <StatRow>
                    <StatLabel>Skipped</StatLabel>
                    <StatValue>{cycleData.tier_summary.skip ?? 0}</StatValue>
                  </StatRow>
                </SummaryCard>
              )}
            </SummaryGrid>

            {/* Signals Section */}
            {cycleData.signals && cycleData.signals.length > 0 && (
              <SignalsSection>
                <TableTitle>
                  🎯 Trading Signals ({cycleData.signals.length})
                </TableTitle>
                {cycleData.signals.map((signal, index) => (
                  <SignalCard key={signal.market_id || index}>
                    <SignalHeader>
                      <SignalTitle>
                        {signal.market_id || `Signal ${index + 1}`}
                      </SignalTitle>
                      <Badge
                        $variant={
                          signal.action?.includes('yes') ? 'success' : 'error'
                        }
                      >
                        {signal.action?.toUpperCase() ||
                          signal.side?.toUpperCase() ||
                          'N/A'}
                      </Badge>
                    </SignalHeader>
                    <SignalStats>
                      <SignalStat>
                        <SignalStatLabel>Market Price</SignalStatLabel>
                        <SignalStatValue>
                          {((signal.market_price ?? 0) * 100).toFixed(1)}%
                        </SignalStatValue>
                      </SignalStat>
                      <SignalStat>
                        <SignalStatLabel>Fair Value</SignalStatLabel>
                        <SignalStatValue>
                          {(
                            (signal.fair_value ??
                              signal.estimated_probability ??
                              0) * 100
                          ).toFixed(1)}
                          %
                        </SignalStatValue>
                      </SignalStat>
                      <SignalStat>
                        <SignalStatLabel>Edge</SignalStatLabel>
                        <SignalStatValue $highlight>
                          {((signal.edge ?? 0) * 100).toFixed(1)}%
                        </SignalStatValue>
                      </SignalStat>
                      <SignalStat>
                        <SignalStatLabel>Kelly</SignalStatLabel>
                        <SignalStatValue>
                          {((signal.kelly_fraction ?? 0) * 100).toFixed(1)}%
                        </SignalStatValue>
                      </SignalStat>
                      <SignalStat>
                        <SignalStatLabel>Position</SignalStatLabel>
                        <SignalStatValue>
                          ${(signal.position_size ?? 0).toFixed(0)}
                        </SignalStatValue>
                      </SignalStat>
                      <SignalStat>
                        <SignalStatLabel>Expected Value</SignalStatLabel>
                        <SignalStatValue $highlight>
                          ${(signal.expected_value ?? 0).toFixed(0)}
                        </SignalStatValue>
                      </SignalStat>
                    </SignalStats>
                    {signal.reasoning && (
                      <SignalReasoning>{signal.reasoning}</SignalReasoning>
                    )}
                  </SignalCard>
                ))}
              </SignalsSection>
            )}

            {/* Markets Table */}
            <TableSection>
              <TableTitle>📋 Markets ({filteredMarkets.length})</TableTitle>
              <FilterToggle>
                <ToggleLabel>
                  <input
                    type='checkbox'
                    checked={showOnlyPassed}
                    onChange={(e) => setShowOnlyPassed(e.target.checked)}
                  />
                  Show only markets that passed filters
                </ToggleLabel>
              </FilterToggle>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Platform</Th>
                      <Th>Title</Th>
                      <Th>Category</Th>
                      <Th>Tier</Th>
                      <Th>End Date</Th>
                      <Th>Prices</Th>
                      <Th>Volume</Th>
                      <Th>Liquidity</Th>
                      <Th>Passed</Th>
                      <Th>Checks</Th>
                      <Th>Reasons</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkets.map((market, index) => (
                      <Tr key={market.market_id || index}>
                        <Td>{index + 1}</Td>
                        <Td>
                          <Badge $variant='info'>
                            {market.platform ?? 'N/A'}
                          </Badge>
                        </Td>
                        <Td>
                          <MarketTitle>
                            {market.title ?? 'Untitled'}
                          </MarketTitle>
                        </Td>
                        <Td>{market.category ?? 'N/A'}</Td>
                        <Td>
                          {market.volume_tier ? (
                            <TierBadge $tier={market.volume_tier}>
                              {market.volume_tier}
                            </TierBadge>
                          ) : (
                            'N/A'
                          )}
                        </Td>
                        <Td>
                          {market.end_date
                            ? formatDate(market.end_date)
                            : 'N/A'}
                        </Td>
                        <Td>
                          <PriceCell>
                            <PriceRow>
                              <PriceLabel>Yes:</PriceLabel>
                              <PriceValue>
                                ${(market.prices?.yes ?? 0).toFixed(2)}
                              </PriceValue>
                            </PriceRow>
                            <PriceRow>
                              <PriceLabel>No:</PriceLabel>
                              <PriceValue>
                                ${(market.prices?.no ?? 0).toFixed(2)}
                              </PriceValue>
                            </PriceRow>
                          </PriceCell>
                        </Td>
                        <Td>${(market.stats?.volume ?? 0).toLocaleString()}</Td>
                        <Td>
                          ${(market.stats?.liquidity ?? 0).toLocaleString()}
                        </Td>
                        <Td>
                          {market.filters &&
                          Object.keys(market.filters).length > 0 &&
                          market.filters.passed !== undefined ? (
                            <Badge
                              $variant={
                                market.filters.passed ? 'success' : 'error'
                              }
                            >
                              {market.filters.passed ? 'Yes' : 'No'}
                            </Badge>
                          ) : (
                            <Badge $variant='warning'>N/A</Badge>
                          )}
                        </Td>
                        <Td>
                          {market.filters?.checks &&
                          Object.keys(market.filters.checks).length > 0 ? (
                            <>
                              <div>
                                <CheckIcon
                                  $passed={
                                    market.filters.checks.volume_ok ?? false
                                  }
                                >
                                  {market.filters.checks.volume_ok ? '✓' : '✗'}
                                </CheckIcon>{' '}
                                Volume
                              </div>
                              <div>
                                <CheckIcon
                                  $passed={
                                    market.filters.checks.liquidity_ok ?? false
                                  }
                                >
                                  {market.filters.checks.liquidity_ok
                                    ? '✓'
                                    : '✗'}
                                </CheckIcon>{' '}
                                Liquidity
                              </div>
                              <div>
                                <CheckIcon
                                  $passed={
                                    market.filters.checks.price_ok ?? false
                                  }
                                >
                                  {market.filters.checks.price_ok ? '✓' : '✗'}
                                </CheckIcon>{' '}
                                Price
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#666' }}>—</span>
                          )}
                        </Td>
                        <Td>
                          {(market.filters?.reasons?.length ?? 0) > 0 ? (
                            <ReasonsList>
                              {market.filters?.reasons?.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ReasonsList>
                          ) : (
                            <span style={{ color: '#28a745' }}>—</span>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableSection>
          </ReportSection>
        </>
      )}
    </PageContainer>
  );
}
