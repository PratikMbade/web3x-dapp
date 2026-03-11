import { Badge } from '@/components/ui/badge';

interface PackageBadgeProps {
  package: string;
}

export function PackageBadge({ package: packageName }: PackageBadgeProps) {
 

  const getPackageColor = (pkg: string) => {
    switch (pkg.toLowerCase()) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getPackageColor(packageName)} border-0`}
    >
      {packageName}
    </Badge>
  );
}
