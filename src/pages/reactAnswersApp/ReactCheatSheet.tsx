import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import reactAnswers from '../../assets/reactAnswers.json';
import ReactAnswerModal from './ReactAnswerModal';

const Container = styled.div`
  font-color: white;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 10%;

  h1 {
    color: white;
    margin-bottom: 20px;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.02);
  }
`;

const SearchResults = styled.div`
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const CategoryHeader = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 20px;
  color: white;
  text-transform: uppercase;
`;

const AnswerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: white;
  gap: 15px;
  overflow-x: auto;
  padding: 0 10px;
`;

const CategoryContainer = styled.div`
  margin: 10px 0;
  padding: 20px;
  border: 1px solid white;
  flex: 1;
  min-width: 300px;
  max-width: 350px;
  max-height: 800px;
  min-height: 600px;
  border-radius: 10px;
  overflow-y: auto;
  text-align: center;
  will-change: scroll-position;

  /* Smooth scrolling */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const Question = styled.strong`
  font-weight: bold;
  margin-top: 10px;
`;

const Answer = styled.p`
  color: white;
`;

const StyledLI = styled.li`
  transition: all 0.2s ease-in-out;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 4px;
  will-change: background-color, transform;

  &:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const ReactCheatSheet: React.FC = () => {
  const [selectedQA, setSelectedQA] = React.useState<{
    question: string;
    answer: string;
    bullets?: string[];
  } | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleCloseModal = useCallback(() => {
    setSelectedQA(null);
  }, []);

  const handleItemClick = useCallback((item: any) => {
    setSelectedQA(item);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Memoize the categories with search filtering
  const { categoriesData, totalResults } = useMemo(() => {
    const allCategories = Object.keys(reactAnswers).map((category) => ({
      category,
      items: reactAnswers[category as keyof typeof reactAnswers],
    }));

    if (!searchTerm.trim()) {
      const total = allCategories.reduce(
        (acc, cat) => acc + cat.items.length,
        0
      );
      return { categoriesData: allCategories, totalResults: total };
    }

    const searchLower = searchTerm.toLowerCase();
    const filteredCategories = allCategories
      .map((categoryData) => {
        const filteredItems = categoryData.items.filter((item) => {
          const questionMatch = item.question
            .toLowerCase()
            .includes(searchLower);
          const answerMatch = item.answer.toLowerCase().includes(searchLower);
          const bulletsMatch =
            item.bullets?.some((bullet) =>
              bullet.toLowerCase().includes(searchLower)
            ) || false;
          return questionMatch || answerMatch || bulletsMatch;
        });

        return {
          ...categoryData,
          items: filteredItems,
        };
      })
      .filter((categoryData) => categoryData.items.length > 0);

    const total = filteredCategories.reduce(
      (acc, cat) => acc + cat.items.length,
      0
    );
    return { categoriesData: filteredCategories, totalResults: total };
  }, [searchTerm]);

  return (
    <Container>
      <h1>React Cheat Sheet</h1>

      <SearchContainer>
        <SearchInput
          type='text'
          placeholder='Search questions, answers, or topics...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <SearchResults>
          {searchTerm
            ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`
            : `${totalResults} total items`}
        </SearchResults>
      </SearchContainer>

      {selectedQA && (
        <ReactAnswerModal qaItem={selectedQA} onClose={handleCloseModal} />
      )}
      <AnswerContainer>
        {categoriesData.map(({ category, items }) => (
          <CategoryContainer key={category}>
            <CategoryHeader>{category}</CategoryHeader>
            <ul>
              {items.map((item, index) => {
                const { question, answer } = item;
                return (
                  <StyledLI
                    onClick={() => handleItemClick(item)}
                    key={`${category}-${index}`}
                  >
                    <Question>{question}</Question>
                    <Answer>{answer}</Answer>
                  </StyledLI>
                );
              })}
            </ul>
          </CategoryContainer>
        ))}
      </AnswerContainer>
    </Container>
  );
};

export default ReactCheatSheet;
