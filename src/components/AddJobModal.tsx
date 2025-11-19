import React, { useState } from 'react';
import styled from 'styled-components';
import {
  createJob,
  type CreateJobData,
  JOB_STATUSES,
  getJobStatusLabel,
} from '../api/jobs';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.xl};
  border-radius: ${(props) => props.theme.borderRadius.xl};
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${(props) => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.text};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}40;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}40;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 1rem;
  background: ${(props) => props.theme.colors.white};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primaryLight}40;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === 'primary'
      ? `
    background: ${(props: any) => props.theme.colors.primary};
    color: ${(props: any) => props.theme.colors.white};

    &:hover:not(:disabled) {
      background: ${(props: any) => props.theme.colors.primaryDark};
      transform: translateY(-1px);
    }

    &:disabled {
      background: ${(props: any) => props.theme.colors.textSecondary};
      cursor: not-allowed;
    }
  `
      : `
    background: ${(props: any) => props.theme.colors.border};
    color: ${(props: any) => props.theme.colors.text};

    &:hover {
      background: ${(props: any) => props.theme.colors.textSecondary};
      color: ${(props: any) => props.theme.colors.white};
    }
  `}
`;

const ErrorMessage = styled.div`
  background: ${(props) => props.theme.colors.error};
  color: ${(props) => props.theme.colors.white};
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const RequiredIndicator = styled.span`
  color: ${(props) => props.theme.colors.error};
  margin-left: 2px;
`;

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
  userId: string;
}

const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  onJobAdded,
  userId,
}) => {
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    company: '',
    description: '',
    jobUrl: '',
    salary: '',
    location: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }
    if (!formData.appliedDate) {
      setError('Application date is required');
      return;
    }

    try {
      setLoading(true);

      const result = await createJob(userId, formData);

      if (result) {
        // Reset form
        setFormData({
          title: '',
          company: '',
          description: '',
          jobUrl: '',
          salary: '',
          location: '',
          status: 'applied',
          appliedDate: new Date().toISOString().split('T')[0],
        });

        onJobAdded();
        onClose();
      } else {
        setError('Failed to create job. Please try again.');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError('An error occurred while creating the job.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while submitting

    setFormData({
      title: '',
      company: '',
      description: '',
      jobUrl: '',
      salary: '',
      location: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add New Job</ModalTitle>
          <CloseButton onClick={handleClose} disabled={loading}>
            ×
          </CloseButton>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor='title'>
                Job Title<RequiredIndicator>*</RequiredIndicator>
              </Label>
              <Input
                id='title'
                name='title'
                type='text'
                value={formData.title}
                onChange={handleChange}
                placeholder='e.g., Senior Software Engineer'
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='company'>
                Company<RequiredIndicator>*</RequiredIndicator>
              </Label>
              <Input
                id='company'
                name='company'
                type='text'
                value={formData.company}
                onChange={handleChange}
                placeholder='e.g., Google'
                required
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor='description'>Job Description</Label>
            <TextArea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Brief description of the role...'
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor='location'>Location</Label>
              <Input
                id='location'
                name='location'
                type='text'
                value={formData.location}
                onChange={handleChange}
                placeholder='e.g., San Francisco, CA'
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='salary'>Salary</Label>
              <Input
                id='salary'
                name='salary'
                type='text'
                value={formData.salary}
                onChange={handleChange}
                placeholder='e.g., $120k - $160k'
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor='status'>Status</Label>
              <Select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleChange}
              >
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getJobStatusLabel(status)}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor='appliedDate'>
                Applied Date<RequiredIndicator>*</RequiredIndicator>
              </Label>
              <Input
                id='appliedDate'
                name='appliedDate'
                type='date'
                value={formData.appliedDate}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor='jobUrl'>Job URL</Label>
            <Input
              id='jobUrl'
              name='jobUrl'
              type='url'
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder='https://...'
            />
          </FormGroup>

          <ButtonGroup>
            <Button
              type='button'
              variant='secondary'
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' variant='primary' disabled={loading}>
              {loading ? 'Adding...' : 'Add Job'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddJobModal;
