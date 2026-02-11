import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../components/themed-components';

// Types based on the cycle JSON structure
interface MarketFilter {
  passed: boolean;
  checks: {
    volume_ok: boolean;
    liquidity_ok: boolean;
    price_ok: boolean;
  };
  reasons: string[];
}

interface Market {
  market_id: string;
  platform: string;
  title: string;
  description: string;
  category: string;
  end_date: string;
  prices: {
    yes: number;
    no: number;
  };
  stats: {
    volume: number;
    liquidity: number;
  };
  filters: MarketFilter;
  analysis: unknown | null;
  opportunity: unknown | null;
  signal: unknown | null;
  execution: unknown | null;
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
  cycle: number;
  started_at: string;
  finished_at: string;
  config: CycleConfig;
  counts: CycleCounts;
  api_cost: ApiCost;
  markets: Market[];
  signals: unknown[];
  errors: unknown[];
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

export default function MarketCycleAnalyzer() {
  const [jsonInput, setJsonInput] = useState('');
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyPassed, setShowOnlyPassed] = useState(false);

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

  const filteredMarkets = cycleData?.markets.filter(
    (market) => !showOnlyPassed || market.filters.passed,
  );

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
          {/* Summary Cards */}
          <SummaryGrid>
            <SummaryCard>
              <SummaryTitle>🔄 Cycle Info</SummaryTitle>
              <StatRow>
                <StatLabel>Cycle Number</StatLabel>
                <StatValue>{cycleData.cycle}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Started</StatLabel>
                <StatValue>{formatDate(cycleData.started_at)}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Finished</StatLabel>
                <StatValue>{formatDate(cycleData.finished_at)}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Provider</StatLabel>
                <StatValue>{cycleData.config.analysis_provider}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Dry Run</StatLabel>
                <StatValue>{cycleData.config.dry_run ? 'Yes' : 'No'}</StatValue>
              </StatRow>
            </SummaryCard>

            <SummaryCard>
              <SummaryTitle>📈 Counts</SummaryTitle>
              <StatRow>
                <StatLabel>Scanned</StatLabel>
                <StatValue>{cycleData.counts.scanned}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Passed Filters</StatLabel>
                <StatValue>{cycleData.counts.passed_filters}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Analyzed</StatLabel>
                <StatValue>{cycleData.counts.analyzed}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Opportunities</StatLabel>
                <StatValue>{cycleData.counts.opportunities}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Signals</StatLabel>
                <StatValue>{cycleData.counts.signals}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Executed</StatLabel>
                <StatValue>{cycleData.counts.executed}</StatValue>
              </StatRow>
            </SummaryCard>

            <SummaryCard>
              <SummaryTitle>💰 API Cost</SummaryTitle>
              <StatRow>
                <StatLabel>Total Cost</StatLabel>
                <StatValue>
                  ${cycleData.api_cost.total_cost.toFixed(4)}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Total Requests</StatLabel>
                <StatValue>{cycleData.api_cost.total_requests}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Input Tokens</StatLabel>
                <StatValue>
                  {cycleData.api_cost.total_input_tokens.toLocaleString()}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Output Tokens</StatLabel>
                <StatValue>
                  {cycleData.api_cost.total_output_tokens.toLocaleString()}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Avg Cost/Request</StatLabel>
                <StatValue>
                  ${cycleData.api_cost.avg_cost_per_request.toFixed(4)}
                </StatValue>
              </StatRow>
            </SummaryCard>

            <SummaryCard>
              <SummaryTitle>⚙️ Configuration</SummaryTitle>
              <StatRow>
                <StatLabel>Min Volume</StatLabel>
                <StatValue>
                  ${cycleData.config.filters.min_volume.toLocaleString()}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Min Liquidity</StatLabel>
                <StatValue>
                  ${cycleData.config.filters.min_liquidity.toLocaleString()}
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Min Edge</StatLabel>
                <StatValue>
                  {(cycleData.config.strategy.min_edge * 100).toFixed(0)}%
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Min Confidence</StatLabel>
                <StatValue>
                  {(cycleData.config.strategy.min_confidence * 100).toFixed(0)}%
                </StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Max Position Size</StatLabel>
                <StatValue>
                  ${cycleData.config.risk.max_position_size.toLocaleString()}
                </StatValue>
              </StatRow>
            </SummaryCard>
          </SummaryGrid>

          {/* Markets Table */}
          <TableSection>
            <TableTitle>📋 Markets ({filteredMarkets?.length || 0})</TableTitle>
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
                  {filteredMarkets?.map((market, index) => (
                    <Tr key={market.market_id}>
                      <Td>{index + 1}</Td>
                      <Td>
                        <Badge $variant='info'>{market.platform}</Badge>
                      </Td>
                      <Td>
                        <MarketTitle>{market.title}</MarketTitle>
                      </Td>
                      <Td>{market.category}</Td>
                      <Td>{formatDate(market.end_date)}</Td>
                      <Td>
                        <PriceCell>
                          <PriceRow>
                            <PriceLabel>Yes:</PriceLabel>
                            <PriceValue>
                              ${market.prices.yes.toFixed(2)}
                            </PriceValue>
                          </PriceRow>
                          <PriceRow>
                            <PriceLabel>No:</PriceLabel>
                            <PriceValue>
                              ${market.prices.no.toFixed(2)}
                            </PriceValue>
                          </PriceRow>
                        </PriceCell>
                      </Td>
                      <Td>${market.stats.volume.toLocaleString()}</Td>
                      <Td>${market.stats.liquidity.toLocaleString()}</Td>
                      <Td>
                        <Badge
                          $variant={market.filters.passed ? 'success' : 'error'}
                        >
                          {market.filters.passed ? 'Yes' : 'No'}
                        </Badge>
                      </Td>
                      <Td>
                        <div>
                          <CheckIcon $passed={market.filters.checks.volume_ok}>
                            {market.filters.checks.volume_ok ? '✓' : '✗'}
                          </CheckIcon>{' '}
                          Volume
                        </div>
                        <div>
                          <CheckIcon
                            $passed={market.filters.checks.liquidity_ok}
                          >
                            {market.filters.checks.liquidity_ok ? '✓' : '✗'}
                          </CheckIcon>{' '}
                          Liquidity
                        </div>
                        <div>
                          <CheckIcon $passed={market.filters.checks.price_ok}>
                            {market.filters.checks.price_ok ? '✓' : '✗'}
                          </CheckIcon>{' '}
                          Price
                        </div>
                      </Td>
                      <Td>
                        {market.filters.reasons.length > 0 ? (
                          <ReasonsList>
                            {market.filters.reasons.map((reason, i) => (
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
        </>
      )}
    </PageContainer>
  );
}
