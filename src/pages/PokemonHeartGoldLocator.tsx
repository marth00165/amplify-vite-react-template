import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

// Types for PokéAPI response
interface EncounterMethod {
  name: string;
}

// Evolution chain types
interface EvolutionDetail {
  min_level?: number;
  min_happiness?: number;
  min_affection?: number;
  time_of_day?: string;
  held_item?: {
    name: string;
  } | null;
  item?: {
    name: string;
  } | null;
  known_move?: {
    name: string;
  } | null;
  location?: {
    name: string;
  } | null;
  trigger: {
    name: string;
  };
}

interface EvolutionChainNode {
  species: {
    name: string;
  };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainNode[];
}

interface EvolutionChain {
  chain: EvolutionChainNode;
}

interface PokemonSpecies {
  evolution_chain: {
    url: string;
  };
}

interface EvolutionData {
  preEvolution: string;
  condition: string;
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

const EvolutionHint = styled.div`
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  color: #fff3cd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: center;
`;

const EvolutionButton = styled.button`
  background: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
  }
`;

const SuggestionsContainer = styled.div`
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.5);
  color: #bbdefb;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  text-align: center;
`;

const SuggestionButton = styled.button`
  background: rgba(33, 150, 243, 0.3);
  border: 1px solid rgba(33, 150, 243, 0.6);
  color: #bbdefb;
  padding: 8px 15px;
  border-radius: 20px;
  margin: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(33, 150, 243, 0.4);
    transform: translateY(-1px);
  }
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
  margin-top: 30px;
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
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
  const CACHE_EXPIRY_MINUTES = 1; // Cache for 1 minute

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
      const minutesDiff = (now - cacheTime) / (1000 * 60);

      if (minutesDiff > CACHE_EXPIRY_MINUTES) {
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

  // Spell checking and suggestion functions
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const getSimilarPokemonNames = async (
    searchTerm: string
  ): Promise<string[]> => {
    try {
      // Get list of all Pokemon from API
      const response = await fetch(
        'https://pokeapi.co/api/v2/pokemon?limit=1000'
      );
      if (!response.ok) return [];

      const data = await response.json();
      const allPokemon = data.results.map((p: any) => p.name);

      // Find similar names using Levenshtein distance
      const searchLower = searchTerm.toLowerCase();
      const similar = allPokemon
        .map((name: string) => ({
          name,
          distance: levenshteinDistance(searchLower, name),
        }))
        .filter((item: any) => item.distance <= 3 && item.distance > 0) // Allow up to 3 character differences
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 5) // Top 5 suggestions
        .map((item: any) => item.name);

      return similar;
    } catch (error) {
      console.error('Error fetching Pokemon suggestions:', error);
      return [];
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

  // Helper function to get immediate pre-evolution form and condition
  const getPreEvolution = async (
    pokemonName: string
  ): Promise<EvolutionData | null> => {
    try {
      const speciesResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemonName.toLowerCase()}`
      );
      if (!speciesResponse.ok) return null;

      const speciesData: PokemonSpecies = await speciesResponse.json();
      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      if (!evolutionResponse.ok) return null;

      const evolutionData: EvolutionChain = await evolutionResponse.json();

      // Helper to format evolution conditions
      const formatEvolutionCondition = (details: EvolutionDetail[]): string => {
        if (!details || details.length === 0) return '';

        const detail = details[0]; // Take the first evolution detail
        const conditions: string[] = [];

        // Base trigger condition
        if (detail.min_level) {
          conditions.push(`at level ${detail.min_level}`);
        } else if (detail.trigger.name === 'level-up') {
          conditions.push('by leveling up');
        } else if (detail.trigger.name === 'trade') {
          conditions.push('by trading');
        } else if (detail.trigger.name === 'use-item') {
          conditions.push('with an item');
        }

        // Additional conditions
        if (detail.time_of_day) {
          conditions.push(`during ${detail.time_of_day}`);
        }

        if (detail.held_item) {
          const itemName = detail.held_item.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`while holding ${itemName}`);
        }

        if (detail.item) {
          const itemName = detail.item.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`using ${itemName}`);
        }

        if (detail.min_happiness) {
          conditions.push(`with high friendship`);
        }

        if (detail.min_affection) {
          conditions.push(`with high affection`);
        }

        if (detail.known_move) {
          const moveName = detail.known_move.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`knowing ${moveName}`);
        }

        if (detail.location) {
          const locationName = detail.location.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`at ${locationName}`);
        }

        // Fallback for unknown triggers
        if (conditions.length === 0) {
          return `by ${detail.trigger.name.replace('-', ' ')}`;
        }

        return conditions.join(' ');
      };

      // Find the immediate pre-evolution by traversing the evolution tree
      const findImmediatePreEvolution = (
        chain: EvolutionChainNode,
        target: string
      ): EvolutionData | null => {
        // Check if any direct evolution of this Pokemon is our target
        for (const evolution of chain.evolves_to) {
          if (evolution.species.name === target.toLowerCase()) {
            return {
              preEvolution: chain.species.name,
              condition: formatEvolutionCondition(evolution.evolution_details),
            };
          }

          // Recursively check deeper evolutions
          const result = findImmediatePreEvolution(evolution, target);
          if (result) return result;
        }
        return null;
      };

      return findImmediatePreEvolution(evolutionData.chain, pokemonName);
    } catch (error) {
      console.error('Error fetching evolution data:', error);
      return null;
    }
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
      setEvolutionData(null); // Reset evolution suggestion
      setSuggestions([]); // Reset suggestions

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
            // Get suggestions for misspelled Pokemon names
            const similarNames = await getSimilarPokemonNames(pokemonName);
            setSuggestions(similarNames);
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

        // Check if we have limited/no data and suggest pre-evolution
        if (gameLocations.length === 0 || gameLocations.length < 3) {
          const evolutionInfo = await getPreEvolution(pokemonName);
          if (
            evolutionInfo &&
            evolutionInfo.preEvolution !== pokemonName.toLowerCase()
          ) {
            setEvolutionData(evolutionInfo);
          } else {
            setEvolutionData(null);
          }
        } else {
          setEvolutionData(null);
        }

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

          {suggestions.length > 0 && (
            <SuggestionsContainer>
              🔍 Did you mean one of these?
              <div>
                {suggestions.map((suggestion) => (
                  <SuggestionButton
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                  </SuggestionButton>
                ))}
              </div>
            </SuggestionsContainer>
          )}

          {evolutionData && (
            <EvolutionHint>
              💡 This Pokémon evolves from{' '}
              <strong>
                {evolutionData.preEvolution.charAt(0).toUpperCase() +
                  evolutionData.preEvolution.slice(1)}
              </strong>
              {evolutionData.condition && (
                <span> {evolutionData.condition}</span>
              )}
              . You might find more encounter locations by searching for its
              pre-evolution form.
              <br />
              <EvolutionButton
                onClick={() => {
                  setSearchTerm(evolutionData.preEvolution);
                  setEvolutionData(null);
                }}
              >
                Search{' '}
                {evolutionData.preEvolution.charAt(0).toUpperCase() +
                  evolutionData.preEvolution.slice(1)}{' '}
                instead
              </EvolutionButton>
            </EvolutionHint>
          )}
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
