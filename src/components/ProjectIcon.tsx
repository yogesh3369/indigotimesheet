import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ProjectIconProps {
  iconName: string | null;
  className?: string;
}

const ProjectIcon = ({ iconName, className = "h-4 w-4" }: ProjectIconProps) => {
  if (!iconName) {
    return <Icons.Folder className={className} />;
  }

  // Convert kebab-case to PascalCase (e.g., 'plane-takeoff' -> 'PlaneTakeoff')
  const iconKey = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') as keyof typeof Icons;

  const IconComponent = Icons[iconKey] as LucideIcon;

  if (!IconComponent) {
    return <Icons.Folder className={className} />;
  }

  return <IconComponent className={className} />;
};

export default ProjectIcon;
