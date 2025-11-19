import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  updateJob,
  deleteJob,
  getJobComments,
  addJobComment,
  type Job,
  type UpdateJobData,
  type JobComment,
  JOB_STATUSES,
  getJobStatusLabel,
  getJobStatusColor,
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
  border-radius: ${(props) => props.theme.borderRadius.xl};
  width: 700px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadows.xl};
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${(props) => props.theme.spacing.xl};
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
  gap: ${(props) => props.theme.spacing.md};
`;

const ModalHeaderContent = styled.div`
  flex: 1;
`;

const StatusBadge = styled.div<{ status: string }>`
  background: ${(props) => getJobStatusColor(props.status as any)};
  color: ${(props) => props.theme.colors.white};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.pill};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const JobTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
  font-size: ${(props) => props.theme.typography.fontSizes.xxxl};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
`;

const JobCompany = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
  font-size: ${(props) => props.theme.typography.fontSizes.xl};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${(props) => props.theme.typography.fontSizes.xxxl};
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius.round};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  overflow-y: auto;
  flex: 1;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const InfoLabel = styled.span`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
`;

const InfoLink = styled.a`
  color: ${(props) => props.theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Description = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.lg};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const DescriptionLabel = styled.h4`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
`;

const DescriptionText = styled.p`
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  line-height: ${(props) => props.theme.typography.lineHeights.relaxed};
  white-space: pre-wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.primaryDark};
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: ${props.theme.colors.error};
          color: ${props.theme.colors.white};
          &:hover:not(:disabled) {
            background: #c82333;
            transform: translateY(-1px);
          }
        `;
      case 'warning':
        return `
          background: ${props.theme.colors.warning};
          color: ${props.theme.colors.text};
          &:hover:not(:disabled) {
            background: #e0a800;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.border};
          color: ${props.theme.colors.text};
          &:hover:not(:disabled) {
            background: ${props.theme.colors.textSecondary};
            color: ${props.theme.colors.white};
          }
        `;
    }
  }}

  &:disabled {
    background: ${(props) => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const CommentsSection = styled.div`
  border-top: 2px solid ${(props) => props.theme.colors.border};
  margin-top: ${(props) => props.theme.spacing.xl};
  padding-top: ${(props) => props.theme.spacing.xl};
`;

const CommentsHeader = styled.h4`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
`;

const CommentInput = styled.textarea`
  width: 100%;
  padding: ${(props) => props.theme.spacing.sm};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSizes.md};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: ${(props) => props.theme.spacing.md};
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

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.md};
`;

const CommentItem = styled.div`
  background: ${(props) => props.theme.colors.surface};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  border-left: 4px solid ${(props) => props.theme.colors.primary};
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const CommentText = styled.p`
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  line-height: ${(props) => props.theme.typography.lineHeights.normal};
`;

const EmptyComments = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-style: italic;
  margin: ${(props) => props.theme.spacing.xl} 0;
`;

const StatusSelect = styled.select`
  padding: ${(props) => props.theme.spacing.sm};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  background: ${(props) => props.theme.colors.white};
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdated: () => void;
  onJobDeleted: () => void;
  userId: string;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdated,
  onJobDeleted,
  userId,
}) => {
  const [comments, setComments] = useState<JobComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (job && isOpen) {
      loadComments();
    }
  }, [job, isOpen]);

  const loadComments = async () => {
    if (!job) return;

    try {
      setCommentsLoading(true);
      const commentsData = await getJobComments(job.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!job) return;

    try {
      setLoading(true);
      const updateData: UpdateJobData = { status: newStatus as any };
      const result = await updateJob(job.id, updateData);

      if (result) {
        // Add a status change comment
        await addJobComment(
          job.id,
          userId,
          `Status changed to ${getJobStatusLabel(newStatus as any)}`,
          'status_change'
        );

        onJobUpdated();
        loadComments();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the job "${job.title}" at ${job.company}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const success = await deleteJob(job.id);

      if (success) {
        onJobDeleted();
        onClose();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!job || !newComment.trim()) return;

    try {
      setLoading(true);
      const result = await addJobComment(
        job.id,
        userId,
        newComment.trim(),
        'comment'
      );

      if (result) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !job) return null;

  return (
    <ModalBackdrop onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalHeaderContent>
            <StatusBadge status={job.status}>
              {getJobStatusLabel(job.status)}
            </StatusBadge>
            <JobTitle>{job.title}</JobTitle>
            <JobCompany>{job.company}</JobCompany>
          </ModalHeaderContent>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <InfoGrid>
            {job.location && (
              <InfoItem>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>📍 {job.location}</InfoValue>
              </InfoItem>
            )}

            {job.salary && (
              <InfoItem>
                <InfoLabel>Salary</InfoLabel>
                <InfoValue>💰 {job.salary}</InfoValue>
              </InfoItem>
            )}

            <InfoItem>
              <InfoLabel>Applied Date</InfoLabel>
              <InfoValue>📅 {formatDate(job.appliedDate)}</InfoValue>
            </InfoItem>

            {job.jobUrl && (
              <InfoItem>
                <InfoLabel>Job Posting</InfoLabel>
                <InfoValue>
                  <InfoLink
                    href={job.jobUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    🔗 View Job Posting
                  </InfoLink>
                </InfoValue>
              </InfoItem>
            )}

            <InfoItem>
              <InfoLabel>Status</InfoLabel>
              <StatusSelect
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
              >
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getJobStatusLabel(status)}
                  </option>
                ))}
              </StatusSelect>
            </InfoItem>
          </InfoGrid>

          {job.description && (
            <Description>
              <DescriptionLabel>Job Description</DescriptionLabel>
              <DescriptionText>{job.description}</DescriptionText>
            </Description>
          )}

          <ActionButtons>
            <Button
              variant='danger'
              onClick={handleDeleteJob}
              disabled={loading}
            >
              Delete Job
            </Button>
          </ActionButtons>

          <CommentsSection>
            <CommentsHeader>Comments ({comments.length})</CommentsHeader>

            <CommentInput
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder='Add a comment about this job application...'
              disabled={loading}
            />

            <Button
              variant='primary'
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
            >
              {loading ? 'Adding...' : 'Add Comment'}
            </Button>

            <CommentsList>
              {commentsLoading ? (
                <EmptyComments>Loading comments...</EmptyComments>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id}>
                    <CommentMeta>
                      {comment.type === 'status_change'
                        ? '🔄'
                        : comment.type === 'interview_scheduled'
                        ? '📅'
                        : '💬'}
                      {formatDateTime(comment.createdAt || '')}
                    </CommentMeta>
                    <CommentText>{comment.content}</CommentText>
                  </CommentItem>
                ))
              ) : (
                <EmptyComments>
                  No comments yet. Add one to track your progress!
                </EmptyComments>
              )}
            </CommentsList>
          </CommentsSection>
        </ModalBody>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default JobDetailsModal;
