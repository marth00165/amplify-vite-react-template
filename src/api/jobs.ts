import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// Type aliases for cleaner code
type JobStatus =
  | 'applied'
  | 'response'
  | 'interviewing'
  | 'rejected'
  | 'offer'
  | 'accepted';
type CommentType = 'comment' | 'status_change' | 'interview_scheduled';

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  description?: string | null;
  jobUrl?: string | null;
  salary?: string | null;
  location?: string | null;
  status: JobStatus;
  appliedDate: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface JobComment {
  id: string;
  jobId: string;
  userId: string;
  content: string;
  type: CommentType;
  createdAt?: string | null;
}

export interface CreateJobData {
  title: string;
  company: string;
  description?: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  status: JobStatus;
  appliedDate: string;
}

export interface UpdateJobData {
  title?: string;
  company?: string;
  description?: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  status?: JobStatus;
}

// Helper function to transform Amplify data to our Job interface
function transformToJob(data: any): Job {
  return {
    id: data.id,
    userId: data.userId,
    title: data.title,
    company: data.company,
    description: data.description,
    jobUrl: data.jobUrl,
    salary: data.salary,
    location: data.location,
    status: data.status as JobStatus,
    appliedDate: data.appliedDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// Helper function to transform Amplify data to our JobComment interface
function transformToJobComment(data: any): JobComment {
  return {
    id: data.id,
    jobId: data.jobId,
    userId: data.userId,
    content: data.content,
    type: data.type as CommentType,
    createdAt: data.createdAt,
  };
}

// Job CRUD operations
export async function createJob(
  userId: string,
  jobData: CreateJobData
): Promise<Job | null> {
  try {
    const now = new Date().toISOString();

    const result = await client.models.Job.create({
      userId,
      ...jobData,
      createdAt: now,
      updatedAt: now,
    });

    if (result.errors) {
      console.error('Error creating job:', result.errors);
      return null;
    }

    return transformToJob(result.data);
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

export async function getJobs(userId: string): Promise<Job[]> {
  try {
    const result = await client.models.Job.list({
      filter: { userId: { eq: userId } },
    });

    if (result.errors) {
      console.error('Error fetching jobs:', result.errors);
      return [];
    }

    return (result.data || []).map(transformToJob);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const result = await client.models.Job.get({ id: jobId });

    if (result.errors) {
      console.error('Error fetching job:', result.errors);
      return null;
    }

    return result.data ? transformToJob(result.data) : null;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export async function updateJob(
  jobId: string,
  updates: UpdateJobData
): Promise<Job | null> {
  try {
    const now = new Date().toISOString();

    const result = await client.models.Job.update({
      id: jobId,
      ...updates,
      updatedAt: now,
    });

    if (result.errors) {
      console.error('Error updating job:', result.errors);
      return null;
    }

    return transformToJob(result.data);
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    const result = await client.models.Job.delete({ id: jobId });

    if (result.errors) {
      console.error('Error deleting job:', result.errors);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

export async function getJobsByStatus(
  userId: string,
  status: JobStatus
): Promise<Job[]> {
  try {
    const result = await client.models.Job.list({
      filter: {
        userId: { eq: userId },
        status: { eq: status },
      },
    });

    if (result.errors) {
      console.error('Error fetching jobs by status:', result.errors);
      return [];
    }

    return (result.data || []).map(transformToJob);
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    return [];
  }
}

// Job Comment operations
export async function addJobComment(
  jobId: string,
  userId: string,
  content: string,
  type: CommentType = 'comment'
): Promise<JobComment | null> {
  try {
    const now = new Date().toISOString();

    const result = await client.models.JobComment.create({
      jobId,
      userId,
      content,
      type,
      createdAt: now,
    });

    if (result.errors) {
      console.error('Error adding job comment:', result.errors);
      return null;
    }

    return transformToJobComment(result.data);
  } catch (error) {
    console.error('Error adding job comment:', error);
    return null;
  }
}

export async function getJobComments(jobId: string): Promise<JobComment[]> {
  try {
    const result = await client.models.JobComment.list({
      filter: { jobId: { eq: jobId } },
    });

    if (result.errors) {
      console.error('Error fetching job comments:', result.errors);
      return [];
    }

    // Sort by creation date (newest first)
    const comments = (result.data || []).map(transformToJobComment);
    return comments.sort(
      (a, b) =>
        new Date(b.createdAt || '').getTime() -
        new Date(a.createdAt || '').getTime()
    );
  } catch (error) {
    console.error('Error fetching job comments:', error);
    return [];
  }
}

export async function deleteJobComment(commentId: string): Promise<boolean> {
  try {
    const result = await client.models.JobComment.delete({ id: commentId });

    if (result.errors) {
      console.error('Error deleting job comment:', result.errors);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting job comment:', error);
    return false;
  }
}

// Utility functions
export function getJobStatusColor(status: JobStatus): string {
  const statusColors = {
    applied: '#4285f4', // Blue
    response: '#ff9800', // Orange
    interviewing: '#9c27b0', // Purple
    rejected: '#f44336', // Red
    offer: '#4caf50', // Green
    accepted: '#2e7d32', // Dark Green
  };

  return statusColors[status] || '#757575';
}

export function getJobStatusLabel(status: JobStatus): string {
  const statusLabels = {
    applied: 'Applied',
    response: 'Response Received',
    interviewing: 'Interviewing',
    rejected: 'Rejected',
    offer: 'Offer Received',
    accepted: 'Accepted',
  };

  return statusLabels[status] || status;
}

export const JOB_STATUSES: JobStatus[] = [
  'applied',
  'response',
  'interviewing',
  'rejected',
  'offer',
  'accepted',
];
