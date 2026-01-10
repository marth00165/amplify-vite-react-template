import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

// Types for PokéAPI response
interface EncounterMethod {
  name: string;
}

interface EncounterDetail {
  min_level: number;
  max_level: number;
  chance: number;
  method: EncounterMethod;
}

interface VersionDetail {
  version: {
    name: string;
  };
  encounter_details: EncounterDetail[];
}

interface LocationArea {
  name: string;
  url: string;
}

interface EncounterLocation {
  location_area: LocationArea;
  version_details: VersionDetail[];
}

// Formatted data for UI
interface PokemonLocationData {
  pokemon: string;
  version: string;
  timeOfDay?: string;
  locations: {
    location: string;
    method: string;
    levels: string;
    rate: string;
  }[];
}

const Container = styled.main`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  color: white;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SearchInput = styled.input`
  width: calc(100% - 120px);
  padding: 15px 20px;
  font-size: 16px;
  border: none;
  border-radius: 10px 0 0 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  &::placeholder {
    color: #666;
  }
`;

const SearchButton = styled.button`
  width: 120px;
  padding: 15px 20px;
  font-size: 16px;
  border: none;
  border-radius: 0 10px 10px 0;
  background: #ff6b6b;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;

  &:hover {
    background: #ff5252;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SearchForm = styled.form`
  display: flex;
  margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.5);
  color: #ffcccb;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const CacheIndicator = styled.div`
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: #c8e6c9;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
`;

const SelectLabel = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PokemonCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const LocationCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;
const PokemonName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #ffd54f;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const LocationInfo = styled.div`
  margin-bottom: 15px;
`;

const LocationTitle = styled.h4`
  color: #81c784;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const LocationDetails = styled.p`
  margin: 5px 0;
  opacity: 0.9;
  line-height: 1.4;
`;

const NoResults = styled.div`
  text-align: center;
  font-size: 1.2rem;
  opacity: 0.8;
  margin-top: 40px;
`;

// Sample Pokemon location data for HeartGold
const PokemonLocator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('heartgold');
  const [selectedTime, setSelectedTime] = useState('day');
  const [pokemonData, setPokemonData] = useState<PokemonLocationData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isFromCache, setIsFromCache] = useState(false);

  // SEO meta data based on current search
  const getPageTitle = () => {
    if (pokemonData) {
      return `${pokemonData.pokemon} Location Guide - ${pokemonData.version} | Pokemon Finder`;
    }
    const selectedGameLabel =
      gameVersions.find((g) => g.value === selectedGame)?.label || 'Pokemon';
    return `Pokemon Location Finder - ${selectedGameLabel} Encounter Guide | Where to Find Pokemon`;
  };

  const getMetaDescription = () => {
    if (pokemonData) {
      const locationCount = pokemonData.locations.length;
      return `Find ${pokemonData.pokemon} in ${
        pokemonData.version
      }! ${locationCount} location${
        locationCount !== 1 ? 's' : ''
      } with encounter rates, levels, and methods. Complete Pokemon location guide.`;
    }
    return 'Find where to catch any Pokemon in HeartGold, SoulSilver, Diamond, Pearl, Platinum and more. Complete location guide with encounter rates, levels, and methods using real PokeAPI data.';
  };

  const getKeywords = () => {
    const baseKeywords = [
      'pokemon location finder',
      'pokemon encounter guide',
      'pokemon heartgold locations',
      'pokemon soulsilver guide',
      'where to find pokemon',
      'pokemon catch locations',
      'pokeapi pokemon finder',
      'pokemon location database',
    ];

    if (pokemonData) {
      baseKeywords.push(
        `${pokemonData.pokemon.toLowerCase()} location`,
        `where to find ${pokemonData.pokemon.toLowerCase()}`,
        `${pokemonData.pokemon.toLowerCase()} ${selectedGame}`,
        `${pokemonData.pokemon.toLowerCase()} encounter rate`
      );
    }

    return baseKeywords.join(', ');
  };

  // Game versions available in PokeAPI
  const gameVersions = [
    { value: 'heartgold', label: 'Pokemon HeartGold' },
    { value: 'soulsilver', label: 'Pokemon SoulSilver' },
    { value: 'diamond', label: 'Pokemon Diamond' },
    { value: 'pearl', label: 'Pokemon Pearl' },
    { value: 'platinum', label: 'Pokemon Platinum' },
    { value: 'black', label: 'Pokemon Black' },
    { value: 'white', label: 'Pokemon White' },
    { value: 'black-2', label: 'Pokemon Black 2' },
    { value: 'white-2', label: 'Pokemon White 2' },
    { value: 'x', label: 'Pokemon X' },
    { value: 'y', label: 'Pokemon Y' },
  ];

  // Time of day options
  const timeOptions = [
    { value: 'day', label: 'Day' },
    { value: 'night', label: 'Night' },
    { value: 'morning', label: 'Morning' },
    { value: 'evening', label: 'Evening' },
  ];

  // Cache configuration
  const CACHE_KEY = 'pokemon-locator-cache-v2'; // Updated version to invalidate old cache
  const CACHE_EXPIRY_HOURS = 24; // Cache for 24 hours

  // Clean up old cache format on mount
  useEffect(() => {
    const oldCacheKeys = ['pokemon-locator-cache', 'pokemon-heartgold-cache'];

    oldCacheKeys.forEach((oldKey) => {
      if (localStorage.getItem(oldKey)) {
        localStorage.removeItem(oldKey);
      }
    });
  }, []);

  // Cache helper functions
  const getCachedData = (
    pokemonName: string,
    game: string,
    time: string
  ): PokemonLocationData | null => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return null;

      const parsedCache = JSON.parse(cache);
      const cacheKey = `${pokemonName.toLowerCase()}-${game}-${time}`;
      const cacheEntry = parsedCache[cacheKey];

      if (!cacheEntry) return null;

      const now = new Date().getTime();
      const cacheTime = new Date(cacheEntry.timestamp).getTime();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff > CACHE_EXPIRY_HOURS) {
        // Cache expired, remove entry
        delete parsedCache[cacheKey];
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  const setCachedData = (
    pokemonName: string,
    game: string,
    time: string,
    data: PokemonLocationData
  ) => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      const parsedCache = cache ? JSON.parse(cache) : {};
      const cacheKey = `${pokemonName.toLowerCase()}-${game}-${time}`;

      parsedCache[cacheKey] = {
        data,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(parsedCache));
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  };

  // Helper function to format location names
  const formatLocationName = (name: string): string => {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\s+Area$/, '');
  };

  // Helper function to format method names
  const formatMethodName = (method: string): string => {
    const methodMap: { [key: string]: string } = {
      walk: 'Grass',
      surf: 'Surf',
      'old-rod': 'Old Rod',
      'good-rod': 'Good Rod',
      'super-rod': 'Super Rod',
      'rock-smash': 'Rock Smash',
      headbutt: 'Headbutt',
      gift: 'Gift',
      'only-one': 'Only One',
    };
    return (
      methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1)
    );
  };

  // Fetch Pokemon encounter data from PokeAPI
  const fetchPokemonData = useCallback(
    async (pokemonName: string) => {
      setLoading(true);
      setError('');
      setPokemonData(null);

      // Check cache first
      const cachedData = getCachedData(pokemonName, selectedGame, selectedTime);
      if (cachedData) {
        setPokemonData(cachedData);
        setIsFromCache(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}/encounters`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Pokémon "${pokemonName}" not found`);
          }
          throw new Error('Failed to fetch Pokémon data');
        }

        const encounterData: EncounterLocation[] = await response.json();

        // Filter for selected game encounters only
        const encounterMap = new Map<
          string,
          {
            location: string;
            method: string;
            levels: Set<number>;
            rates: number[];
          }
        >();

        encounterData.forEach((encounter) => {
          encounter.version_details.forEach((versionDetail) => {
            if (versionDetail.version.name === selectedGame) {
              versionDetail.encounter_details.forEach((detail) => {
                const location = formatLocationName(
                  encounter.location_area.name
                );
                const method = formatMethodName(detail.method.name);
                const key = `${location}-${method}`;

                if (!encounterMap.has(key)) {
                  encounterMap.set(key, {
                    location,
                    method,
                    levels: new Set(),
                    rates: [],
                  });
                }

                const existing = encounterMap.get(key)!;
                // Add all levels in the range
                for (let i = detail.min_level; i <= detail.max_level; i++) {
                  existing.levels.add(i);
                }
                existing.rates.push(detail.chance);
              });
            }
          });
        });

        // Convert map to final format
        const gameLocations: PokemonLocationData['locations'] = Array.from(
          encounterMap.values()
        ).map((encounter) => {
          const sortedLevels = Array.from(encounter.levels).sort(
            (a, b) => a - b
          );
          const levels =
            sortedLevels.length === 1
              ? sortedLevels[0].toString()
              : `${sortedLevels[0]}-${sortedLevels[sortedLevels.length - 1]}`;

          // Sum up encounter rates (they might be for different conditions)
          const totalRate = encounter.rates.reduce(
            (sum, rate) => sum + rate,
            0
          );
          const rate = `${Math.min(totalRate, 100)}%`; // Cap at 100%

          return {
            location: encounter.location,
            method: encounter.method,
            levels,
            rate,
          };
        });

        const selectedGameLabel =
          gameVersions.find((g) => g.value === selectedGame)?.label ||
          selectedGame;

        const result: PokemonLocationData = {
          pokemon:
            pokemonName.charAt(0).toUpperCase() +
            pokemonName.slice(1).toLowerCase(),
          version: selectedGameLabel,
          timeOfDay: selectedTime !== 'day' ? selectedTime : undefined,
          locations: gameLocations,
        };

        // Cache the result
        setCachedData(pokemonName, selectedGame, selectedTime, result);
        setPokemonData(result);
        setIsFromCache(false);

        if (gameLocations.length === 0) {
          setError(
            `${pokemonName} is not available in ${selectedGameLabel}${
              selectedTime !== 'day' ? ` during ${selectedTime}` : ''
            }`
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [selectedGame, selectedTime, gameVersions]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        fetchPokemonData(searchTerm.trim());
      }
    },
    [searchTerm, fetchPokemonData]
  );

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name='description' content={getMetaDescription()} />
        <meta name='keywords' content={getKeywords()} />
        <meta name='robots' content='index, follow' />
        <meta name='author' content='Pokemon Location Finder' />

        {/* Open Graph / Social Media */}
        <meta property='og:type' content='website' />
        <meta property='og:title' content={getPageTitle()} />
        <meta property='og:description' content={getMetaDescription()} />
        <meta property='og:image' content='/pokemon-finder-preview.png' />
        <meta
          property='og:url'
          content='https://yoursite.com/pokemonHeartGold'
        />
        <meta property='og:site_name' content='Pokemon Location Finder' />

        {/* Twitter Cards */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={getPageTitle()} />
        <meta name='twitter:description' content={getMetaDescription()} />
        <meta name='twitter:image' content='/pokemon-finder-preview.png' />

        {/* Additional SEO */}
        <meta name='theme-color' content='#667eea' />
        <link rel='canonical' href='https://yoursite.com/pokemonHeartGold' />

        {/* Structured Data for Pokemon Search */}
        {pokemonData && (
          <script type='application/ld+json'>
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Dataset',
              name: `${pokemonData.pokemon} Location Data - ${pokemonData.version}`,
              description: `Complete encounter information for ${pokemonData.pokemon} in ${pokemonData.version}`,
              url: `https://yoursite.com/pokemonHeartGold?pokemon=${pokemonData.pokemon.toLowerCase()}&game=${selectedGame}`,
              keywords: [
                pokemonData.pokemon,
                pokemonData.version,
                'pokemon location',
                'encounter guide',
              ],
              creator: {
                '@type': 'Organization',
                name: 'Pokemon Location Finder',
              },
              distribution: pokemonData.locations.map((location) => ({
                '@type': 'DataDownload',
                name: location.location,
                contentUrl: location.method,
                encodingFormat: `Level ${location.levels}, ${location.rate} encounter rate`,
              })),
            })}
          </script>
        )}
      </Helmet>
      <Container>
        <Header role='banner'>
          <Title>Pokemon Location Finder</Title>
          <Subtitle>
            Find where to catch your favorite Pokemon in any game! Select a game
            version, time of day, and enter a Pokemon name to discover all
            encounter locations.
          </Subtitle>
        </Header>

        <SearchContainer role='search' aria-label='Pokemon search form'>
          <FilterRow>
            <SelectContainer>
              <SelectLabel htmlFor='game-select'>Game Version</SelectLabel>
              <Select
                id='game-select'
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                aria-label='Select Pokemon game version'
              >
                {gameVersions.map((game) => (
                  <option key={game.value} value={game.value}>
                    {game.label}
                  </option>
                ))}
              </Select>
            </SelectContainer>

            <SelectContainer>
              <SelectLabel htmlFor='time-select'>Time of Day</SelectLabel>
              <Select
                id='time-select'
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                aria-label='Select time of day for encounters'
              >
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </Select>
            </SelectContainer>
          </FilterRow>

          <SearchForm onSubmit={handleSearch} role='form'>
            <SearchInput
              type='text'
              placeholder='Enter Pokemon name (e.g., Pikachu, Geodude, Magikarp)'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label='Enter Pokemon name to search'
              autoComplete='off'
            />
            <SearchButton
              type='submit'
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? <LoadingSpinner /> : 'Search'}
            </SearchButton>
          </SearchForm>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </SearchContainer>

        <ResultsContainer role='main' aria-live='polite'>
          {pokemonData && (
            <PokemonCard>
              {isFromCache && (
                <CacheIndicator>
                  🚀 Loaded from cache - No API call needed!
                </CacheIndicator>
              )}
              <PokemonName id='pokemon-title'>
                {pokemonData.pokemon} in {pokemonData.version}
                {pokemonData.timeOfDay && ` (${pokemonData.timeOfDay})`}
              </PokemonName>
              <LocationGrid
                role='list'
                aria-label='Pokemon encounter locations'
              >
                {pokemonData.locations.map((location, index) => (
                  <LocationCard key={index} role='listitem'>
                    <LocationInfo>
                      <LocationTitle>{location.location}</LocationTitle>
                    </LocationInfo>
                    <LocationDetails>
                      <strong>Method:</strong> {location.method}
                    </LocationDetails>
                    <LocationDetails>
                      <strong>Level:</strong> {location.levels}
                    </LocationDetails>
                    <LocationDetails>
                      <strong>Encounter Rate:</strong> {location.rate}
                    </LocationDetails>
                  </LocationCard>
                ))}
              </LocationGrid>
            </PokemonCard>
          )}

          {!loading && !pokemonData && !error && (
            <NoResults>
              Select a game version and search for a Pokemon to find its
              locations!
            </NoResults>
          )}
        </ResultsContainer>
      </Container>
    </>
  );
};

export default PokemonLocator;
