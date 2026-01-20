import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import JobDetailsView from '../components/jobs/JobDetailsView';

const getJobIdFromQuery = (search) => {
  const params = new URLSearchParams(search);
  const rawId = params.get('id');
  if (!rawId) return null;
  const parts = rawId.split('-');
  return parts[parts.length - 1] || rawId;
};

export default function JobDetailsPublic() {
  const location = useLocation();
  const { slug } = useParams();
  const jobId = getJobIdFromQuery(location.search);

  return <JobDetailsView jobId={jobId} jobSlug={slug} />;
}
