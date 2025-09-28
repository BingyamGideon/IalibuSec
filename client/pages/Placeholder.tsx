import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface PlaceholderProps {
  title?: string;
  description?: string;
  backTo?: string;
}

export default function Placeholder({ 
  title = "Page Under Development", 
  description = "This page is currently being built. Please check back later.",
  backTo = "/"
}: PlaceholderProps) {
  const navigate = useNavigate();
  const params = useParams();
  
  const pageTitle = title || `${params.section?.charAt(0).toUpperCase()}${params.section?.slice(1)} Management`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{pageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{description}</p>
          <p className="text-sm text-gray-500">
            Continue prompting to have this page implemented with full functionality.
          </p>
          <Button 
            onClick={() => navigate(backTo)} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
