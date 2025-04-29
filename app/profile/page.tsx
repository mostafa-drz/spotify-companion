import { PageLayout } from '@/app/components/layout/PageLayout';
import { Button } from '@/app/components/ui/Button';

export default function ProfilePage() {
  // Placeholder user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    imageUrl: 'https://via.placeholder.com/150',
    connectedServices: ['Spotify'],
    savedAnalyses: 3,
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              <img 
                src={user.imageUrl} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-secondary">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Connected Services</h2>
          <div className="space-y-3">
            {user.connectedServices.map((service) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="font-medium">{service}</span>
                </div>
                <Button variant="secondary" size="sm">Disconnect</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Account Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-secondary text-sm">Saved Analyses</p>
              <p className="text-2xl font-bold">{user.savedAnalyses}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-secondary text-sm">Playlists Analyzed</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary">Sign Out</Button>
        </div>
      </div>
    </PageLayout>
  );
} 