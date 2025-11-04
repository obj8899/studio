import TeamProfileClient from './page-client';

export default async function TeamProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you might fetch server-side data here
  const { id } = params;

  return <TeamProfileClient id={id} />;
}
