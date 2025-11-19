import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuthenticator } from '@aws-amplify/ui-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  getJobs,
  type Job,
  JOB_STATUSES,
  getJobStatusLabel,
  getJobStatusColor,
  updateJob,
} from '../api/jobs';
import { getOrCreateUser } from '../api/user';
import AddJobModal from '../components/AddJobModal';
import JobDetailsModal from '../components/JobDetailsModal';

// Using theme from styled-components ThemeProvider

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.primary};
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
`;

const AddJobButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const KanbanBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 500px;
`;

const ColumnHeader = styled.div<{ statusColor: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 3px solid ${(props) => props.statusColor};
`;

const ColumnTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const JobCount = styled.span`
  background: ${(props) => props.theme.colors.primaryLight};
  color: ${(props) => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: auto;
`;

const JobCard = styled.div<{ isDragging?: boolean }>`
  background: ${(props) => props.theme.colors.white};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  transition: all 0.2s;
  border-left: 4px solid transparent;
  opacity: ${(props) => (props.isDragging ? 0.6 : 1)};
  transform: ${(props) => (props.isDragging ? 'rotate(5deg)' : 'none')};

  &:hover {
    transform: ${(props) =>
      props.isDragging ? 'rotate(5deg)' : 'translateY(-1px)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left-color: ${(props) => props.theme.colors.primary};
  }
`;

const JobTitle = styled.h4`
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const JobCompany = styled.p`
  color: ${(props) => props.theme.colors.primary};
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const JobDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const JobLocation = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  &:before {
    content: '📍';
  }
`;

const JobSalary = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  &:before {
    content: '💰';
  }
`;

const JobDate = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;

  &:before {
    content: '📅';
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-style: italic;
  margin-top: 20px;
`;

const LoadingState = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 40px 0;
`;

const DropZone = styled.div<{ isOver: boolean }>`
  min-height: 400px;
  transition: all 0.2s;
  ${(props) =>
    props.isOver &&
    `
    background: ${props.theme.colors.primaryLight}20;
    border: 2px dashed ${props.theme.colors.primary};
    border-radius: ${props.theme.borderRadius.lg};
  `}
`;

// DroppableColumn component
interface DroppableColumnProps {
  id: string;
  status: string;
  jobCount: number;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  status,
  jobCount,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const statusColor = getJobStatusColor(status as any);

  return (
    <Column>
      <ColumnHeader statusColor={statusColor}>
        <ColumnTitle>{getJobStatusLabel(status as any)}</ColumnTitle>
        <JobCount>{jobCount}</JobCount>
      </ColumnHeader>
      <DropZone ref={setNodeRef} isOver={isOver}>
        {children}
      </DropZone>
    </Column>
  );
};

// DraggableJobCard component
interface DraggableJobCardProps {
  job: Job;
  onClick: () => void;
}

const DraggableJobCard: React.FC<DraggableJobCardProps> = ({
  job,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <JobCard isDragging={isDragging} onClick={onClick}>
        <JobTitle>{job.title}</JobTitle>
        <JobCompany>{job.company}</JobCompany>
        <JobDetails>
          {job.location && <JobLocation>{job.location}</JobLocation>}
          {job.salary && <JobSalary>{job.salary}</JobSalary>}
          <JobDate>Applied {formatDate(job.appliedDate)}</JobDate>
        </JobDetails>
      </JobCard>
    </div>
  );
};

const JobTracker: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);

      // Get user data from our User model
      const userData = await getOrCreateUser();
      if (!userData) {
        console.error('User not found or could not be created');
        return;
      }

      setCurrentUserId(userData.cognitoId);
      const jobsData = await getJobs(userData.cognitoId);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  const getJobsByStatusGroup = (status: (typeof JOB_STATUSES)[number]) => {
    return jobs.filter((job) => job.status === status);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleAddJob = () => {
    setShowAddModal(true);
  };

  const handleJobAdded = () => {
    loadJobs(); // Refresh the jobs list
  };

  const handleJobUpdated = () => {
    loadJobs(); // Refresh the jobs list
  };

  const handleJobDeleted = () => {
    loadJobs(); // Refresh the jobs list
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const jobId = active.id as string;
    const newStatus = over.id as string;

    // Find the job being dragged
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    try {
      // Optimistically update the UI
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.id === jobId ? { ...j, status: newStatus as any } : j
        )
      );

      // Update the job status in the backend
      await updateJob(jobId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating job status:', error);
      // Revert the optimistic update on error by reloading jobs
      await loadJobs();
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Loading your jobs...</LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Job Tracker</Title>
        <AddJobButton onClick={handleAddJob}>Add Job</AddJobButton>
      </Header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <KanbanBoard>
          {JOB_STATUSES.map((status) => {
            const statusJobs = getJobsByStatusGroup(status);

            return (
              <DroppableColumn
                key={status}
                id={status}
                status={status}
                jobCount={statusJobs.length}
              >
                {statusJobs.length > 0 ? (
                  statusJobs.map((job) => (
                    <DraggableJobCard
                      key={job.id}
                      job={job}
                      onClick={() => handleJobClick(job)}
                    />
                  ))
                ) : (
                  <EmptyState>No jobs in this status</EmptyState>
                )}
              </DroppableColumn>
            );
          })}
        </KanbanBoard>
      </DndContext>

      {/* Add Job Modal */}
      {showAddModal && currentUserId && (
        <AddJobModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onJobAdded={handleJobAdded}
          userId={currentUserId}
        />
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && currentUserId && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={showJobDetails}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
          userId={currentUserId}
        />
      )}
    </PageContainer>
  );
};

export default JobTracker;
