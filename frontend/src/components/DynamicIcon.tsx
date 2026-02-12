import { getIconComponent } from "@/constants/icons";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const IconComponent = getIconComponent(name);
  return <IconComponent {...props} />;
};
