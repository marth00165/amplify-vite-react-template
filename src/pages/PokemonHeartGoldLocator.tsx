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

interface EvolutionLineStage {
  name: string;
  evolutionCondition?: string;
}

interface EvolutionLine {
  stages: EvolutionLineStage[];
}

interface LocationPokemon {
  pokemon: string;
  methods: {
    method: string;
    levels: string;
    rate: string;
  }[];
}

interface LocationData {
  name: string;
  pokemon: LocationPokemon[];
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

const EvolutionLineContainer = styled.div`
  background: linear-gradient(
    135deg,
    rgba(124, 77, 255, 0.2),
    rgba(0, 150, 136, 0.2)
  );
  border: 1px solid rgba(124, 77, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const EvolutionLineTitle = styled.h3`
  color: #e1bee7;
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 1.2em;
  font-weight: 600;
`;

const EvolutionStagesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const EvolutionStage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
`;

const PokemonStage = styled.div<{ isCurrentPokemon?: boolean }>`
  background: ${(props) =>
    props.isCurrentPokemon
      ? 'linear-gradient(135deg, #4CAF50, #45A049)'
      : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid
    ${(props) =>
      props.isCurrentPokemon ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  padding: 12px 16px;
  border-radius: 25px;
  font-weight: ${(props) => (props.isCurrentPokemon ? 'bold' : 'normal')};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.isCurrentPokemon
      ? '0 4px 15px rgba(76, 175, 80, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover {
    transform: translateY(-2px);
    background: ${(props) =>
      props.isCurrentPokemon
        ? 'linear-gradient(135deg, #66BB6A, #4CAF50)'
        : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const EvolutionArrow = styled.div`
  color: #b39ddb;
  font-size: 1.5em;
  margin: 0 5px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &::before {
    content: '→';
  }
`;

const EvolutionCondition = styled.div`
  color: #e1bee7;
  font-size: 0.85em;
  text-align: center;
  margin-top: 5px;
  font-style: italic;
  max-width: 100px;
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

const LocationCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LocationCardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #fff;
  text-align: center;
`;

const PokemonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const LocationPokemonCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const LocationPokemonName = styled.h4`
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #ffd54f;
  text-transform: capitalize;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const MethodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MethodItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MethodName = styled.div`
  font-size: 0.9rem;
  color: #81c784;
  font-weight: bold;
  margin-bottom: 4px;
`;

const MethodDetail = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FiltersContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
  }

  &::placeholder {
    color: #666;
  }
`;

const ClearFiltersButton = styled.button`
  background: rgba(255, 107, 107, 0.3);
  border: 1px solid rgba(255, 107, 107, 0.5);
  color: #ffcccb;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 107, 107, 0.4);
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
  const [evolutionLine, setEvolutionLine] = useState<EvolutionLine | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [browsingMode, setBrowsingMode] = useState<'pokemon' | 'location'>(
    'pokemon'
  );
  const [filterText, setFilterText] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>('');

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
    // Generation 1
    { value: 'red', label: 'Pokemon Red' },
    { value: 'blue', label: 'Pokemon Blue' },
    { value: 'yellow', label: 'Pokemon Yellow' },

    // Generation 2
    { value: 'gold', label: 'Pokemon Gold' },
    { value: 'silver', label: 'Pokemon Silver' },
    { value: 'crystal', label: 'Pokemon Crystal' },

    // Generation 3
    { value: 'ruby', label: 'Pokemon Ruby' },
    { value: 'sapphire', label: 'Pokemon Sapphire' },
    { value: 'emerald', label: 'Pokemon Emerald' },
    { value: 'firered', label: 'Pokemon FireRed' },
    { value: 'leafgreen', label: 'Pokemon LeafGreen' },

    // Generation 4
    { value: 'diamond', label: 'Pokemon Diamond' },
    { value: 'pearl', label: 'Pokemon Pearl' },
    { value: 'platinum', label: 'Pokemon Platinum' },
    { value: 'heartgold', label: 'Pokemon HeartGold' },
    { value: 'soulsilver', label: 'Pokemon SoulSilver' },

    // Generation 5
    { value: 'black', label: 'Pokemon Black' },
    { value: 'white', label: 'Pokemon White' },
    { value: 'black-2', label: 'Pokemon Black 2' },
    { value: 'white-2', label: 'Pokemon White 2' },

    // Generation 6
    { value: 'x', label: 'Pokemon X' },
    { value: 'y', label: 'Pokemon Y' },
    { value: 'omega-ruby', label: 'Pokemon Omega Ruby' },
    { value: 'alpha-sapphire', label: 'Pokemon Alpha Sapphire' },

    // Generation 7
    { value: 'sun', label: 'Pokemon Sun' },
    { value: 'moon', label: 'Pokemon Moon' },
    { value: 'ultra-sun', label: 'Pokemon Ultra Sun' },
    { value: 'ultra-moon', label: 'Pokemon Ultra Moon' },

    // Generation 8
    { value: 'sword', label: 'Pokemon Sword' },
    { value: 'shield', label: 'Pokemon Shield' },
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

  // Fetch available locations when game changes
  useEffect(() => {
    const loadLocations = async () => {
      if (browsingMode === 'location') {
        setLoading(true);
        const locations = await fetchAvailableLocations(selectedGame);
        setAvailableLocations(locations);
        setLoading(false);

        // Reset selected location when game changes
        setSelectedLocation('');
        setLocationData(null);
      }
    };

    loadLocations();
  }, [selectedGame, browsingMode]);

  // Auto-hide evolution suggestion after 15 seconds
  useEffect(() => {
    if (evolutionData) {
      const timer = setTimeout(() => {
        setEvolutionData(null);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [evolutionData]);

  // Clear evolution suggestion when switching to location mode
  useEffect(() => {
    if (browsingMode === 'location') {
      setEvolutionData(null);
      setEvolutionLine(null);
    }
  }, [browsingMode]);

  // Refresh location data when time changes (if location is selected)
  useEffect(() => {
    if (browsingMode === 'location' && selectedLocation) {
      handleLocationSelect(selectedLocation);
    }
  }, [selectedTime, browsingMode, selectedLocation]);

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

  // Location browsing functions
  const fetchAvailableLocations = async (
    gameName: string
  ): Promise<string[]> => {
    try {
      // Instead of trying to get all locations, we'll build a set of locations
      // by sampling Pokemon and collecting their encounter locations for this game
      const samplePokemonIds = [
        1, 4, 7, 10, 16, 19, 21, 25, 32, 35, 39, 41, 43, 46, 48, 50, 52, 54, 56,
        58, 60, 63, 66, 69, 72, 74, 77, 79, 81, 84, 86, 90, 92, 95, 96, 98, 100,
        102, 104, 106, 108, 109, 111, 113, 115, 116, 118, 120, 122, 123, 124,
        125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,
        140, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
      ]; // Sample of Pokemon IDs to check

      const locationsSet = new Set<string>();

      // Check encounters for sample Pokemon
      for (const pokemonId of samplePokemonIds.slice(0, 20)) {
        // Limit to avoid too many API calls
        try {
          const encountersResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`
          );

          if (encountersResponse.ok) {
            const encountersData = await encountersResponse.json();

            for (const encounter of encountersData) {
              for (const versionDetail of encounter.version_details) {
                if (versionDetail.version.name === gameName) {
                  // Extract location name from the location_area URL
                  const locationAreaName = encounter.location_area.name;
                  // Remove area suffixes to get base location name
                  const locationName = locationAreaName.replace(
                    /-area$|-(1f|2f|3f|b1f|b2f|b3f|b4f)$/,
                    ''
                  );
                  locationsSet.add(locationName);
                  break;
                }
              }
            }
          }
        } catch (error) {
          // Continue with next Pokemon if this one fails
          continue;
        }
      }

      const locations = Array.from(locationsSet).sort();

      // If we didn't find many locations, add some common ones for the game
      if (locations.length < 5) {
        const commonLocations = getCommonLocationsForGame(gameName);
        commonLocations.forEach((loc) => locationsSet.add(loc));
      }

      return Array.from(locationsSet).sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  };

  // Helper function to get common locations for each game when API sampling fails
  const getCommonLocationsForGame = (gameName: string): string[] => {
    const locationMap: { [key: string]: string[] } = {
      red: [
        'route-1',
        'route-2',
        'viridian-forest',
        'route-3',
        'mt-moon',
        'route-4',
        'cerulean-cave',
      ],
      blue: [
        'route-1',
        'route-2',
        'viridian-forest',
        'route-3',
        'mt-moon',
        'route-4',
        'cerulean-cave',
      ],
      yellow: [
        'route-1',
        'route-2',
        'viridian-forest',
        'route-3',
        'mt-moon',
        'route-4',
        'cerulean-cave',
      ],
      gold: [
        'route-29',
        'route-30',
        'route-31',
        'route-32',
        'route-33',
        'ilex-forest',
        'route-34',
      ],
      silver: [
        'route-29',
        'route-30',
        'route-31',
        'route-32',
        'route-33',
        'ilex-forest',
        'route-34',
      ],
      crystal: [
        'route-29',
        'route-30',
        'route-31',
        'route-32',
        'route-33',
        'ilex-forest',
        'route-34',
      ],
      ruby: [
        'route-101',
        'route-102',
        'route-103',
        'petalburg-woods',
        'route-104',
        'route-116',
      ],
      sapphire: [
        'route-101',
        'route-102',
        'route-103',
        'petalburg-woods',
        'route-104',
        'route-116',
      ],
      emerald: [
        'route-101',
        'route-102',
        'route-103',
        'petalburg-woods',
        'route-104',
        'route-116',
      ],
      firered: [
        'route-1',
        'route-2',
        'viridian-forest',
        'route-3',
        'mt-moon',
        'route-4',
      ],
      leafgreen: [
        'route-1',
        'route-2',
        'viridian-forest',
        'route-3',
        'mt-moon',
        'route-4',
      ],
      diamond: [
        'route-201',
        'route-202',
        'route-203',
        'route-204',
        'route-205',
        'eterna-forest',
      ],
      pearl: [
        'route-201',
        'route-202',
        'route-203',
        'route-204',
        'route-205',
        'eterna-forest',
      ],
      platinum: [
        'route-201',
        'route-202',
        'route-203',
        'route-204',
        'route-205',
        'eterna-forest',
      ],
      heartgold: [
        'route-29',
        'route-30',
        'route-31',
        'route-32',
        'route-33',
        'ilex-forest',
      ],
      soulsilver: [
        'route-29',
        'route-30',
        'route-31',
        'route-32',
        'route-33',
        'ilex-forest',
      ],
      black: [
        'route-1',
        'route-2',
        'route-3',
        'wellspring-cave',
        'route-4',
        'pinwheel-forest',
      ],
      white: [
        'route-1',
        'route-2',
        'route-3',
        'wellspring-cave',
        'route-4',
        'pinwheel-forest',
      ],
      'black-2': [
        'route-19',
        'route-20',
        'floccesy-ranch',
        'route-1',
        'route-2',
        'route-3',
      ],
      'white-2': [
        'route-19',
        'route-20',
        'floccesy-ranch',
        'route-1',
        'route-2',
        'route-3',
      ],
      x: [
        'route-2',
        'route-3',
        'santalune-forest',
        'route-4',
        'route-5',
        'route-6',
      ],
      y: [
        'route-2',
        'route-3',
        'santalune-forest',
        'route-4',
        'route-5',
        'route-6',
      ],
      'omega-ruby': [
        'route-101',
        'route-102',
        'route-103',
        'petalburg-woods',
        'route-104',
      ],
      'alpha-sapphire': [
        'route-101',
        'route-102',
        'route-103',
        'petalburg-woods',
        'route-104',
      ],
      sun: [
        'route-1',
        'route-2',
        'route-3',
        'melemele-meadow',
        'route-4',
        'route-5',
      ],
      moon: [
        'route-1',
        'route-2',
        'route-3',
        'melemele-meadow',
        'route-4',
        'route-5',
      ],
      'ultra-sun': [
        'route-1',
        'route-2',
        'route-3',
        'melemele-meadow',
        'route-4',
        'route-5',
      ],
      'ultra-moon': [
        'route-1',
        'route-2',
        'route-3',
        'melemele-meadow',
        'route-4',
        'route-5',
      ],
      sword: [
        'route-1',
        'route-2',
        'rolling-fields',
        'dappled-grove',
        'route-3',
      ],
      shield: [
        'route-1',
        'route-2',
        'rolling-fields',
        'dappled-grove',
        'route-3',
      ],
    };

    return locationMap[gameName] || ['route-1', 'route-2', 'route-3'];
  };

  const fetchLocationPokemon = async (
    locationName: string,
    gameName: string,
    timeOfDay: string
  ): Promise<LocationData | null> => {
    try {
      // Get location details
      const locationResponse = await fetch(
        `https://pokeapi.co/api/v2/location/${locationName}`
      );
      if (!locationResponse.ok) return null;

      const locationData = await locationResponse.json();
      const pokemonMap = new Map<string, LocationPokemon>();

      // Process each area in the location
      for (const area of locationData.areas) {
        const areaResponse = await fetch(area.url);
        if (!areaResponse.ok) continue;

        const areaData = await areaResponse.json();

        // Process encounters for each Pokemon
        for (const encounter of areaData.pokemon_encounters) {
          const pokemonName = encounter.pokemon.name;

          // Process version details for selected game
          for (const versionDetail of encounter.version_details) {
            if (versionDetail.version.name === gameName) {
              // Create a map to consolidate methods for this Pokemon
              const methodMap = new Map<
                string,
                {
                  levels: Set<number>;
                  rates: number[];
                }
              >();

              for (const detail of versionDetail.encounter_details) {
                // Filter by time of day if not 'day' (default/all times)
                const conditionValues = detail.condition_values || [];
                const timeConditions = conditionValues.filter(
                  (cv: any) =>
                    cv.name &&
                    (cv.name.includes('time') ||
                      cv.name === 'night' ||
                      cv.name === 'morning' ||
                      cv.name === 'evening')
                );

                let includeEncounter = false;

                if (timeOfDay === 'day') {
                  // If user selected "day" (all times), include all encounters
                  includeEncounter = true;
                } else {
                  // If user selected specific time, check conditions
                  if (timeConditions.length === 0) {
                    // No time conditions means available any time (include for all time selections)
                    includeEncounter = true;
                  } else {
                    // Check if any time condition matches selected time
                    includeEncounter = timeConditions.some(
                      (condition: any) =>
                        condition.name === timeOfDay ||
                        (timeOfDay === 'night' &&
                          condition.name === 'time-night') ||
                        (timeOfDay === 'morning' &&
                          condition.name === 'time-morning') ||
                        (timeOfDay === 'evening' &&
                          condition.name === 'time-evening')
                    );
                  }
                }

                if (includeEncounter) {
                  const baseMethod = formatMethodName(detail.method.name);

                  // Check for special conditions beyond time
                  const specialConditions = conditionValues.filter(
                    (cv: any) =>
                      cv.name &&
                      !cv.name.includes('time') &&
                      cv.name !== 'night' &&
                      cv.name !== 'morning' &&
                      cv.name !== 'evening'
                  );

                  let method = baseMethod;
                  if (specialConditions.length > 0) {
                    // Add special condition to method name
                    const conditionName = specialConditions[0].name;
                    if (conditionName === 'radio') {
                      method = 'Radio';
                    } else if (conditionName.includes('swarm')) {
                      method = `${baseMethod} (Swarm)`;
                    } else if (conditionName.includes('radar')) {
                      method = 'Poké Radar';
                    } else {
                      method = `${baseMethod} (${formatMethodName(
                        conditionName
                      )})`;
                    }
                  }

                  if (!methodMap.has(method)) {
                    methodMap.set(method, {
                      levels: new Set(),
                      rates: [],
                    });
                  }

                  const methodData = methodMap.get(method)!;
                  // Add all levels in the range
                  for (let i = detail.min_level; i <= detail.max_level; i++) {
                    methodData.levels.add(i);
                  }
                  methodData.rates.push(detail.chance);
                }
              }

              // Convert consolidated methods to final format
              const validMethods = Array.from(methodMap.entries()).map(
                ([method, data]) => {
                  const sortedLevels = Array.from(data.levels).sort(
                    (a, b) => a - b
                  );
                  const levels =
                    sortedLevels.length === 1
                      ? sortedLevels[0].toString()
                      : `${sortedLevels[0]}-${
                          sortedLevels[sortedLevels.length - 1]
                        }`;

                  // Sum up encounter rates
                  const totalRate = data.rates.reduce(
                    (sum, rate) => sum + rate,
                    0
                  );
                  const rate = `${Math.min(totalRate, 100)}%`; // Cap at 100%

                  return { method, levels, rate };
                }
              );

              // Only add Pokemon if it has valid encounters for this game/time
              if (validMethods.length > 0) {
                if (!pokemonMap.has(pokemonName)) {
                  pokemonMap.set(pokemonName, {
                    pokemon: pokemonName,
                    methods: [],
                  });
                }

                const pokemon = pokemonMap.get(pokemonName)!;
                pokemon.methods.push(...validMethods);
              }
            }
          }
        }
      }

      return {
        name: formatLocationName(locationName),
        pokemon: Array.from(pokemonMap.values())
          .filter((p) => p.methods.length > 0) // Only include Pokemon with valid encounters
          .sort((a, b) => a.pokemon.localeCompare(b.pokemon)),
      };
    } catch (error) {
      console.error('Error fetching location Pokemon:', error);
      return null;
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

  // Function to get the full evolution line
  const getFullEvolutionLine = async (
    pokemonName: string
  ): Promise<EvolutionLine | null> => {
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
          conditions.push(`Lv.${detail.min_level}`);
        } else if (detail.trigger.name === 'level-up') {
          conditions.push('Level up');
        } else if (detail.trigger.name === 'trade') {
          conditions.push('Trade');
        } else if (detail.trigger.name === 'use-item') {
          conditions.push('Use item');
        }

        // Additional conditions
        if (detail.time_of_day) {
          conditions.push(detail.time_of_day);
        }

        if (detail.held_item) {
          const itemName = detail.held_item.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`Hold ${itemName}`);
        }

        if (detail.item) {
          const itemName = detail.item.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(itemName);
        }

        if (detail.min_happiness) {
          conditions.push('High friendship');
        }

        if (detail.min_affection) {
          conditions.push('High affection');
        }

        if (detail.known_move) {
          const moveName = detail.known_move.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`Know ${moveName}`);
        }

        if (detail.location) {
          const locationName = detail.location.name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          conditions.push(`At ${locationName}`);
        }

        return conditions.join(' + ');
      };

      // Helper to traverse the evolution tree and build stages
      const buildEvolutionStages = (
        chain: EvolutionChainNode
      ): EvolutionLineStage[] => {
        const stages: EvolutionLineStage[] = [];

        // Add current stage
        stages.push({
          name: chain.species.name,
        });

        // Add evolved forms
        for (const evolution of chain.evolves_to) {
          const condition = formatEvolutionCondition(
            evolution.evolution_details
          );
          stages.push({
            name: evolution.species.name,
            evolutionCondition: condition,
          });

          // Recursively add further evolutions
          const furtherEvolutions = buildEvolutionStages(evolution);
          stages.push(...furtherEvolutions.slice(1)); // Skip the first stage as it's already added
        }

        return stages;
      };

      const stages = buildEvolutionStages(evolutionData.chain);

      return {
        stages: stages,
      };
    } catch (error) {
      console.error('Error fetching full evolution line:', error);
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
      radio: 'Radio',
      'poke-radar': 'Poké Radar',
      'honey-tree': 'Honey Tree',
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
      setEvolutionLine(null); // Reset evolution line
      setSuggestions([]); // Reset suggestions

      // Check cache first
      const cachedData = getCachedData(pokemonName, selectedGame, selectedTime);
      if (cachedData) {
        setPokemonData(cachedData);
        setIsFromCache(true);
        setLoading(false);

        // Always fetch and display the full evolution line
        const evolutionLineData = await getFullEvolutionLine(pokemonName);
        setEvolutionLine(evolutionLineData);

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

        // Always fetch and display the full evolution line
        const evolutionLineData = await getFullEvolutionLine(pokemonName);
        setEvolutionLine(evolutionLineData);

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

  // Handle location selection
  const handleLocationSelect = async (locationName: string) => {
    if (!locationName) {
      setLocationData(null);
      return;
    }

    setLoading(true);
    setError('');
    const data = await fetchLocationPokemon(
      locationName,
      selectedGame,
      selectedTime
    );
    setLocationData(data);
    setLoading(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterText('');
    setFilterLevel('');
    setFilterMethod('');
  };

  // Get unique methods for filter dropdown
  const getUniqueMethods = () => {
    const methods = new Set<string>();

    if (pokemonData?.locations) {
      pokemonData.locations.forEach((location) => {
        methods.add(location.method);
      });
    }

    if (locationData?.pokemon) {
      locationData.pokemon.forEach((pokemon) => {
        pokemon.methods.forEach((method) => {
          methods.add(method.method);
        });
      });
    }

    return Array.from(methods).sort();
  };

  // Filter functions
  const matchesLevelFilter = (levelRange: string, filterValue: string) => {
    if (!filterValue.trim()) return true;

    const filter = filterValue.trim();

    // Parse level range (e.g., "15-20" or "25")
    const [minStr, maxStr] = levelRange.split('-').map((s) => s.trim());
    const minLevel = parseInt(minStr);
    const maxLevel = maxStr ? parseInt(maxStr) : minLevel;

    if (filter.includes('-')) {
      // Range filter like "10-20"
      const [filterMin, filterMax] = filter
        .split('-')
        .map((s) => parseInt(s.trim()));
      return maxLevel >= filterMin && minLevel <= filterMax;
    } else {
      // Exact level filter like "15"
      const exactLevel = parseInt(filter);
      return exactLevel >= minLevel && exactLevel <= maxLevel;
    }
  };

  const filterLocationResults = (locations: any[]) => {
    return locations.filter((location) => {
      // Text filter
      if (
        filterText &&
        !location.location.toLowerCase().includes(filterText.toLowerCase())
      ) {
        return false;
      }

      // Level filter
      if (filterLevel && !matchesLevelFilter(location.levels, filterLevel)) {
        return false;
      }

      // Method filter
      if (filterMethod && location.method !== filterMethod) {
        return false;
      }

      return true;
    });
  };

  const filterPokemonResults = (pokemon: any[]) => {
    return pokemon.filter((poke) => {
      // Text filter
      if (
        filterText &&
        !poke.pokemon.toLowerCase().includes(filterText.toLowerCase())
      ) {
        return false;
      }

      // Check if any method matches the filters
      const hasMatchingMethod = poke.methods.some((method: any) => {
        // Level filter
        if (filterLevel && !matchesLevelFilter(method.levels, filterLevel)) {
          return false;
        }

        // Method filter
        if (filterMethod && method.method !== filterMethod) {
          return false;
        }

        return true;
      });

      return hasMatchingMethod;
    });
  };

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
              <SelectLabel htmlFor='mode-select'>Search Mode</SelectLabel>
              <Select
                id='mode-select'
                value={browsingMode}
                onChange={(e) => {
                  setBrowsingMode(e.target.value as 'pokemon' | 'location');
                  setPokemonData(null);
                  setLocationData(null);
                  setError('');
                }}
                aria-label='Select search mode'
              >
                <option value='pokemon'>Search Pokemon</option>
                <option value='location'>Browse Locations</option>
              </Select>
            </SelectContainer>

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

            {browsingMode === 'location' && (
              <SelectContainer>
                <SelectLabel htmlFor='location-select'>Location</SelectLabel>
                <Select
                  id='location-select'
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    handleLocationSelect(e.target.value);
                  }}
                  aria-label='Select location to browse'
                  disabled={loading || availableLocations.length === 0}
                >
                  <option value=''>Choose a location...</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {formatLocationName(location)}
                    </option>
                  ))}
                </Select>
              </SelectContainer>
            )}
          </FilterRow>

          {browsingMode === 'pokemon' && (
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
          )}

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
          {browsingMode === 'pokemon' && pokemonData && (
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

              {/* Evolution Line Display */}
              {evolutionLine && evolutionLine.stages.length > 1 && (
                <EvolutionLineContainer>
                  <EvolutionLineTitle>Evolution Line</EvolutionLineTitle>
                  <EvolutionStagesContainer>
                    {evolutionLine.stages.map((stage, index) => (
                      <React.Fragment key={stage.name}>
                        <EvolutionStage>
                          <PokemonStage
                            isCurrentPokemon={
                              stage.name.toLowerCase() ===
                              pokemonData.pokemon.toLowerCase()
                            }
                            onClick={() => {
                              if (
                                stage.name.toLowerCase() !==
                                pokemonData.pokemon.toLowerCase()
                              ) {
                                setSearchTerm(stage.name);
                                fetchPokemonData(stage.name);
                              }
                            }}
                          >
                            {stage.name.charAt(0).toUpperCase() +
                              stage.name.slice(1)}
                          </PokemonStage>
                          {stage.evolutionCondition && (
                            <EvolutionCondition>
                              {stage.evolutionCondition}
                            </EvolutionCondition>
                          )}
                        </EvolutionStage>
                        {index < evolutionLine.stages.length - 1 && (
                          <EvolutionArrow />
                        )}
                      </React.Fragment>
                    ))}
                  </EvolutionStagesContainer>
                </EvolutionLineContainer>
              )}

              {/* Filters for Pokemon locations */}
              <FiltersContainer>
                <FilterGrid>
                  <FilterInput
                    type='text'
                    placeholder='Filter locations...'
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <FilterInput
                    type='text'
                    placeholder='Filter by level (e.g., 5, 10-15)'
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                  />
                  <FilterInput
                    as='select'
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                  >
                    <option value=''>All methods</option>
                    {getUniqueMethods().map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </FilterInput>
                  {(filterText || filterLevel || filterMethod) && (
                    <ClearFiltersButton onClick={clearFilters}>
                      Clear Filters
                    </ClearFiltersButton>
                  )}
                </FilterGrid>
              </FiltersContainer>

              <LocationGrid
                role='list'
                aria-label='Pokemon encounter locations'
              >
                {filterLocationResults(pokemonData.locations).map(
                  (location, index) => (
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
                  )
                )}
              </LocationGrid>

              {filterLocationResults(pokemonData.locations).length === 0 && (
                <NoResults>
                  {filterText || filterLevel || filterMethod
                    ? 'No locations match your current filters. Try adjusting or clearing the filters.'
                    : 'No encounter locations found for this Pokemon.'}
                </NoResults>
              )}
            </PokemonCard>
          )}

          {browsingMode === 'location' && locationData && (
            <LocationCard>
              <LocationCardTitle>{locationData.name}</LocationCardTitle>

              {/* Filters for Location Pokemon */}
              <FiltersContainer>
                <FilterGrid>
                  <FilterInput
                    type='text'
                    placeholder='Filter Pokemon...'
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                  <FilterInput
                    type='text'
                    placeholder='Filter by level (e.g., 5, 10-15)'
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                  />
                  <FilterInput
                    as='select'
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                  >
                    <option value=''>All methods</option>
                    {getUniqueMethods().map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </FilterInput>
                  {(filterText || filterLevel || filterMethod) && (
                    <ClearFiltersButton onClick={clearFilters}>
                      Clear Filters
                    </ClearFiltersButton>
                  )}
                </FilterGrid>
              </FiltersContainer>

              <PokemonGrid>
                {filterPokemonResults(locationData.pokemon).map(
                  (pokemon, index) => (
                    <LocationPokemonCard key={index}>
                      <LocationPokemonName>
                        {pokemon.pokemon}
                      </LocationPokemonName>
                      <MethodList>
                        {pokemon.methods.map(
                          (method: any, methodIndex: number) => (
                            <MethodItem key={methodIndex}>
                              <MethodName>{method.method}</MethodName>
                              <MethodDetail>
                                <span>Level: {method.levels}</span>
                                <span>Rate: {method.rate}</span>
                              </MethodDetail>
                            </MethodItem>
                          )
                        )}
                      </MethodList>
                    </LocationPokemonCard>
                  )
                )}
              </PokemonGrid>

              {filterPokemonResults(locationData.pokemon).length === 0 && (
                <NoResults>
                  {filterText || filterLevel || filterMethod
                    ? 'No Pokemon match your current filters. Try adjusting or clearing the filters.'
                    : `No Pokemon encounters found in this location for ${
                        gameVersions.find((g) => g.value === selectedGame)
                          ?.label || selectedGame
                      }.`}
                </NoResults>
              )}
            </LocationCard>
          )}

          {!loading && !pokemonData && !locationData && !error && (
            <NoResults>
              {browsingMode === 'pokemon'
                ? 'Select a game version and search for a Pokemon to find its locations!'
                : 'Select a game version and location to see available Pokemon!'}
            </NoResults>
          )}
        </ResultsContainer>
      </Container>
    </>
  );
};

export default PokemonLocator;
